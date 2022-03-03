using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Text.Json;
using System.Threading.Tasks;
using AutoMapper;
using DicomParser;
using DicomViewer.Data;
using DicomViewer.Dtos;
using DicomViewer.Dtos.Request;
using DicomViewer.Entities;
using DicomViewer.Exceptions;
using DicomViewer.Helpers;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using MongoDB.Bson;
using MongoDB.Driver;
using MongoDB.Driver.GridFS;

namespace DicomViewer.Services
{
    public class DicomService : IDicomService
    {

        private readonly IUserService _userService;
        private readonly IUserAccessor _userAccessor;
        private readonly DataContext _dataContext;
        private readonly GridFSBucket _fileGrid;
        private readonly IMapper _mapper;

        public DicomService(
            DataContext dataContext, 
            IUserAccessor userAccessor, 
            IUserService userService,
            IMapper mapper
        )
        {
            _dataContext = dataContext;
            _userAccessor = userAccessor;
            _userService = userService;
            _mapper = mapper;
            
            var client = new MongoClient("mongodb://rootuser:rootpass@localhost:27017");
            var database = client.GetDatabase("dicom");

            _fileGrid = new GridFSBucket(database, new GridFSBucketOptions
            {
                BucketName = "frames",
                ChunkSizeBytes = 1048576, // 1MB
                WriteConcern = WriteConcern.Unacknowledged,
                ReadPreference = ReadPreference.Primary
            });
        }

        public async Task<IEnumerable<StudyMetadata>> GetStudiesMetadata(long patientId)
        {
            var user = await _userService.GetById(_userAccessor.GetUserId());

            if (user.Id != patientId && user.Role is not (Role.Admin or Role.Doctor))
                throw new RestException(HttpStatusCode.Forbidden, new { Error = "You can't access this resource" });

            var metas = await _dataContext.DicomMetas
                .Where(x => x.PatientId == patientId)
                .ToListAsync();

            return _mapper.Map<IEnumerable<StudyMetadata>>(metas);
        }

        public async Task<Stream> GetSlice(SliceRequest request)
        {
            var user = await _userService.GetById(_userAccessor.GetUserId());

            if (user.Id != request.PatientId && user.Role is not (Role.Admin or Role.Doctor))
                throw new RestException(HttpStatusCode.Forbidden, new { Error = "You can't access this resource" });

            var dicom = await _dataContext.DicomMetas.FirstOrDefaultAsync(x =>
                x.StudyId == request.StudyId &&
                x.SeriesId == request.SeriesId &&
                x.InstanceId == request.InstanceId
            );
            
            return await _fileGrid.OpenDownloadStreamAsync(new ObjectId(dicom.MongoId));
        }

        public async Task SaveFiles(SaveFilesRequest request)
        {
            foreach (var file in request.Files)
            {
                await SaveDicomFile(file, request);
            }
        }

        public async Task<dynamic> GetSliceMetadata(SliceMetadataRequest request)
        {
            var user = await _userService.GetById(_userAccessor.GetUserId());

            if (user.Id != request.PatientId && user.Role is not (Role.Admin or Role.Doctor))
                throw new RestException(HttpStatusCode.Forbidden, new { Error = "You can't access this resource" });
            
            var dicom = await _dataContext.DicomMetas.FirstOrDefaultAsync(x =>
                x.StudyId == request.StudyId &&
                x.SeriesId == request.SeriesId &&
                x.InstanceId == request.InstanceId
            );

            return await GetMetadata(new ObjectId(dicom.MongoId));
        }
        
        public async Task<SerieDto> GetSeriesMetadata(SeriesMetadataRequest request)
        {
            var user = await _userService.GetById(_userAccessor.GetUserId());

            if (user.Id != request.PatientId && user.Role is not (Role.Admin or Role.Doctor))
                throw new RestException(HttpStatusCode.Forbidden, new { Error = "You can't access this resource" });
            
            var instances = await _dataContext.DicomMetas
                .Where(x => x.StudyId == request.StudyId && x.SeriesId == request.SeriesId)
                .OrderBy(x => x.InstanceId)
                .ToListAsync();

            var instancesIds = instances.Select(x => x.InstanceId).ToList();

            var instance = instances.First();
            
            return new SerieDto
            {
                StudyId  = instance.StudyId,
                SeriesId = instance.SeriesId,
                Instances = instancesIds,
                InstancesCount = instances.Count,
            };
        }
        
        private async Task<dynamic> GetMetadata(ObjectId id)
        {
            var filter = Builders<GridFSFileInfo>.Filter.Eq("_id", id);
            var results = await _fileGrid.FindAsync(filter);
            return results.First().Metadata.ToDictionary();
        }


        private async Task SaveDicomFile(IFormFile file, SaveFilesRequest request)
        {
            var parser = DicomParse.GetDefaultParser();
            
            await using var stream = file.OpenReadStream();
            var dicom = parser.Parse(stream);
            
            // override patient id to ours.
            dicom.GetEntryByTag("00100020").Value = request.PatientId + "";
            dicom.Entries.Remove("7E011010");
            
            var frame = dicom.Entries[DicomConstats.PixelData].GetAsListBytes()[0];
            dicom.Entries.Remove(DicomConstats.PixelData);
            
            var frameId = await _fileGrid.UploadFromBytesAsync(file.Name, frame, new GridFSUploadOptions
            {
                Metadata = BsonDocument.Parse(JsonSerializer.Serialize(dicom, new JsonSerializerOptions
                {
                    PropertyNamingPolicy = new LowercaseJsonNamingPolicy(),
                }))
            });

            var studyDate = dicom.Entries["00080020"].GetAsDateTime();
            var studyTime = dicom.Entries["00080030"].GetAsTimeSpan();
            var studyDateTime = new DateTime(
                studyDate.Year,
                studyDate.Month,
                studyDate.Day,
                studyTime.Hours,
                studyTime.Minutes,
                studyTime.Seconds
            );
            
            var dk = new DicomMeta
            {
                MongoId = frameId.ToString(),
                PatientId = request.PatientId,
                SeriesId = dicom.Entries["0020000E"].GetAsString().Trim(),
                StudyId = dicom.Entries["0020000D"].GetAsString().Trim(),
                InstanceId = Convert.ToInt32(dicom.Entries["00200013"].GetAsUInt()),
                StudyDescription = dicom.Entries["00081030"].GetAsString().Trim(),
                Modality = dicom.Entries["00080060"].GetAsString().Trim(),
                StudyDate = studyDateTime
            };
            
            Console.WriteLine($"{dk.PatientId}/{dk.StudyId}/{dk.SeriesId}");
            
            _dataContext.DicomMetas.Add(dk);
            await _dataContext.SaveChangesAsync();
        }
    }
}