using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using AutoMapper;
using Core.Entities;
using Core.Helpers;
using Core.Hubs;
using Core.Models;
using Core.Repositories;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.SignalR;
using Microsoft.OpenApi.Extensions;
using Parser;

namespace Core.Services.Impl;

public class DicomService : IDicomService
{

    private readonly IHubContext<ProgressHub> _progressHub;
    private readonly DicomStorageService _dicomStorageService;
    private readonly IUserAccessor _userAccessor;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public DicomService(
        IHubContext<ProgressHub> progressHub, 
        DicomStorageService dicomStorageService, 
        IUserAccessor userAccessor,
        IUnitOfWork unitOfWork, 
        IMapper mapper)
    {
        _dicomStorageService = dicomStorageService;
        _progressHub = progressHub;
        _userAccessor = userAccessor;
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public Guid RunTaskSaveFiles(long patientId, IEnumerable<IFormFile> files)
    {
        var progressGeneratedId = Guid.NewGuid();
        //SaveFiles(patientId, files, progressGeneratedId)
        return progressGeneratedId;
    }

    public async Task SaveFiles(long patientId, IEnumerable<IFormFile> files, Guid guid)
    {
        var invokerId = _userAccessor.GetUserId();
        //var progressGeneratedId = Guid.NewGuid();
        var formFiles = files as IFormFile[] ?? files.ToArray();
        var filesList = formFiles.ToList();
        for (var i = 0; i < filesList.Count; ++i)
        {
            var file = filesList[i];
            await SaveDicomFile(patientId, file);
            await _progressHub.Clients.Group(invokerId.ToString()).SendAsync(
                "broadcastprogress",
                new Progress
                {
                    Id = guid,
                    CurrentProgress = i + 1,
                    TotalProgress = filesList.Count
                });
        }
    }
        
    private async Task SaveDicomFile(long patientId, IFormFile file)
    {
        var parser = DicomParser.GetDefaultParser();

        var user = await _unitOfWork.Users.GetById(patientId);
            
        await using var stream = file.OpenReadStream();
        var dicom = parser.Parse(stream);
            
        var studyDate = dicom.Dataset[DicomConstats.StudyDate].GetAsDateTime();
        var studyTime = dicom.Dataset[DicomConstats.StudyTime].GetAsTimeSpan();
        var studyDateTime = studyDate.SetTime(studyTime);

        var studyOriginalId = dicom.Dataset[DicomConstats.StudyId].GetAsString().Trim();
        var study = await _unitOfWork.Studies.GetByOriginalId(studyOriginalId);
        if (study == null)
        {
            study = new Study
            {
                Date = studyDateTime,
                Description = dicom.Dataset.GetValue(DicomConstats.StudyDescription)?.GetAsString()?.Trim(),
                OriginalId = studyOriginalId,
                User = user
            };
            await _unitOfWork.Studies.Add(study);
        }

        var seriesDate = dicom.Dataset[DicomConstats.SeriesDate].GetAsDateTime();
        var seriesTime = dicom.Dataset.GetValueOrDefault(DicomConstats.SeriesTime, new DicomItem(
            "",
            TimeSpan.Zero
        )).GetAsTimeSpan();
        var seriesDateTime = seriesDate.SetTime(seriesTime);
        var seriesOriginalId = dicom.Dataset[DicomConstats.SeriesId].GetAsString().Trim();
        var series = await _unitOfWork.Series.GetByOriginalId(seriesOriginalId);
        if (series == null)
        {
            series = new Series
            {
                Date = seriesDateTime,
                Description = dicom.Dataset.GetValue(DicomConstats.SeriesDescription)?.GetAsString()?.Trim(),
                OriginalId = seriesOriginalId,
                Modality = dicom.Dataset[DicomConstats.Modality].GetAsString().Trim(),
                Study = study,
                FilePath = Path.Combine(_dicomStorageService.Storage, $"{seriesOriginalId}.bin")
            };
            await _unitOfWork.Series.Add(series);
        }
        //CalculateStatisticsForEachPlaneInSeries(series);

        // override patient related tags
        dicom.GetEntryByTag(DicomConstats.PatientId).Value = patientId.ToString();
        dicom.GetEntryByTag(DicomConstats.PatientName).Value = $"{user.FirstName} {user.LastName}";
        dicom.GetEntryByTag(DicomConstats.PatientGender).Value = user.Gender.GetDisplayName();

        
        var frame = dicom.Dataset[DicomConstats.PixelData].GetAsListBytes()[0];
        var rom = new ReadOnlyMemory<byte>(frame);
        dicom.Dataset.Remove(DicomConstats.PixelData);

        var pInstance = await _unitOfWork.Instances.GetPrevious(dicom.Dataset[DicomConstats.InstanceId].GetAsInt());
        var instance = new Instance
        {
            OriginalId = dicom.Dataset[DicomConstats.InstanceId].GetAsInt(),
            Series = series,
            ChunkSize = rom.Length,
            FileOffset = pInstance?.OriginalId * rom.Length ?? 0,
            DicomMeta = JsonSerializer.Serialize(dicom, new JsonSerializerOptions
            {
                PropertyNamingPolicy = new LowercaseJsonNamingPolicy(),
            })
        };

        await _dicomStorageService.WriteBytesForInstance(instance, rom);

        await _unitOfWork.Instances.Add(instance);
            
        Console.WriteLine($"{patientId}/{study.Id}/{series.Id}");

        await _unitOfWork.CompleteAsync();
    }

    /*
     * These statistics can take some time to calculate, so we do it just once
     * so the client doesn't have to
     */
    private static void CalculateStatisticsForEachPlaneInSeries(Series series)
    {
        var instances = series.Instances;
        var instance = instances[0];
        // default plane
        var filePath = instance.Series.FilePath;
        var planeBytes = new byte[instance.ChunkSize];
        using var reader = new BinaryReader(new FileStream(filePath, FileMode.Open));
        reader.BaseStream.Seek(instance.FileOffset, SeekOrigin.Begin);
        reader.Read(planeBytes, 0, (int)instance.ChunkSize);

        var meta = instance.DicomMeta;
        var dicom = JsonSerializer.Deserialize<Dicom>(meta, new JsonSerializerOptions
        {
            PropertyNamingPolicy = new LowercaseJsonNamingPolicy(),
        });
        var bpp = 16;
        var pr = 1;
        var intercept = -1024;
        var slope = 1;
        CalculateStatisticsForPlane(planeBytes, bpp, pr, intercept, slope);
    }

    private static void CalculateStatisticsForPlane(
        byte[] bytes, 
        int bpp, 
        int pr,
        int intercept,
        int slope
    )
    {
        if (bpp == 16 && pr == 1)
        {
            var arr = new short[(int)Math.Ceiling(bytes.Length / 2.0)];
            Buffer.BlockCopy(bytes, 0, arr, 0, bytes.Length);
            
            var min = long.MaxValue;
            var max = long.MinValue;
            var sum = 0;
            for (var i = 0; i < arr.Length; ++i)
            {
                var actualValue = arr[i] * slope + intercept;
                sum += actualValue;
                if (actualValue < min) min = actualValue;
                if (actualValue > max) max = actualValue;
            }

            var avg = sum / arr.Length;
            var stSum = 0D;
            for (var i = 0; i < arr.Length; ++i)
            {
                var actualValue = arr[i] * slope + intercept;
                stSum += Math.Pow(actualValue - avg, 2);
            }
            
            var stDev = Math.Sqrt(stSum / arr.Length);
        }
    }
}