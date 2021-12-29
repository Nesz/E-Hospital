using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using DicomParser;
using DicomViewer.Data;
using DicomViewer.Dtos;
using DicomViewer.Entities;
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

        private readonly DataContext _dataContext;
        private readonly GridFSBucket _fileGrid;

        public DicomService(DataContext dataContext)
        {
            var client = new MongoClient("mongodb://rootuser:rootpass@localhost:27017");
            var database = client.GetDatabase("dicom");
            _dataContext = dataContext;

            _fileGrid = new GridFSBucket(database, new GridFSBucketOptions
            {
                BucketName = "frames",
                ChunkSizeBytes = 1048576, // 1MB
                WriteConcern = WriteConcern.Unacknowledged,
                ReadPreference = ReadPreference.Primary
            });
        }

        public async Task<IEnumerable<DicomMeta>> GetList()
        {
            return await _dataContext.DicomMetas.ToListAsync();
        }
        
        public async Task<Stream> GetFrameData(string studyId, string seriesId, int instanceId)
        {
            var dicom = await _dataContext.DicomMetas.FirstOrDefaultAsync(x =>
                x.StudyId == studyId &&
                x.SeriesId == seriesId &&
                x.InstanceId == instanceId
            );

            return await GetFrameStream(new ObjectId(dicom.MongoId));
        }

        public async Task SaveDicom(Dicom dicom, string filename)
        {
            var frame = dicom.Entries[DicomConstats.PixelData].GetAsListBytes()[0];
            dicom.Entries.Remove(DicomConstats.PixelData);
            dicom.Entries.Remove("7E011010");
            
            var frameId = await _fileGrid.UploadFromBytesAsync(filename, frame, new GridFSUploadOptions
            {
                Metadata = BsonDocument.Parse(JsonSerializer.Serialize(dicom, new JsonSerializerOptions
                {
                    PropertyNamingPolicy = new LowercaseJsonNamingPolicy(),
                }))
            });
            
            var dk = new DicomMeta
            {
                MongoId = frameId.ToString(),
                PatientId = dicom.Entries["00100020"].GetAsString().Trim(),
                SeriesId = dicom.Entries["0020000E"].GetAsString().Trim(),
                StudyId = dicom.Entries["0020000D"].GetAsString().Trim(),
                InstanceId = Convert.ToInt32(dicom.Entries["00200013"].GetAsUInt()),
            };
            
            Console.WriteLine($"{dk.PatientId}/{dk.StudyId}/{dk.SeriesId}");
            
            _dataContext.DicomMetas.Add(dk);
            await _dataContext.SaveChangesAsync();
        }

        public async Task<dynamic> GetMetadata(ObjectId id)
        {
            var filter = Builders<GridFSFileInfo>.Filter.Eq("_id", id);
            var results = await _fileGrid.FindAsync(filter);
            return results.First().Metadata.ToDictionary();
        }
        
        public async Task<Stream> GetFrameStream(ObjectId id)
        {
            return await _fileGrid.OpenDownloadStreamAsync(id);
        }

        public async Task SaveFiles(IEnumerable<IFormFile> files)
        {
            var parser = DicomParse.GetDefaultParser();

            foreach (var file in files)
            {
                await using (var stream = file.OpenReadStream())
                {
                    var dicom = parser.Parse(stream);
                    //tasks.Add(SaveDicom(dicom, file.Name));
                    await SaveDicom(dicom, file.Name);
                }
            }

            //await Task.WhenAll(tasks);
        }

        public async Task<dynamic> GetFrameMetadata(string studyId, string seriesId, int instanceId)
        {
            var dicom = await _dataContext.DicomMetas.FirstOrDefaultAsync(x =>
                x.StudyId == studyId &&
                x.SeriesId == seriesId &&
                x.InstanceId == instanceId
            );

            /*var dicom = await _dataContext.DicomMetas
                .Where(x => x.StudyId == studyId && x.SeriesId == seriesId)
                .OrderBy(x => x.InstanceId)
                .Skip(frameNumber)
                .FirstOrDefaultAsync();*/
            
            return await GetMetadata(new ObjectId(dicom.MongoId));
        }
        
        public async Task<dynamic> GetSeriesMetadata(string studyId, string seriesId)
        {
            var instances = await _dataContext.DicomMetas
                .Where(x => x.StudyId == studyId && x.SeriesId == seriesId)
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
    }
}