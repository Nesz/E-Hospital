using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using Core.Dtos;
using Core.Entities;
using Core.Models;
using Core.Repositories;
using Microsoft.AspNetCore.Mvc;

namespace Core.Services.Impl;

public class SeriesService : ISeriesService
{
    
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public SeriesService(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<Page<SeriesDto>> GetSeriesPaged(long patientId, PageRequestDto request)
    {
        var instances = await _unitOfWork.Series.GetInstancesForPatientId(
            patientId,
            request.PageNumber,
            request.PageSize
        );
            
        return _mapper.Map<Page<SeriesDto>>(instances);
    }

    public async Task<SeriesDto> GetSeriesByPatientAndSeriesId(long patientId, long seriesId)
    {
        var series = await _unitOfWork.Series.GetSeriesByPatientAndSeriesId(patientId, seriesId);
        return _mapper.Map<SeriesDto>(series);
    }

    public async Task<dynamic> GetInstanceMetaForSeries(long seriesId)
    {
        var series = await _unitOfWork.Series.GetById(seriesId);
        var instance = await _unitOfWork.Instances.GetInstanceById(series.Instances.First().Id);
        return instance.DicomMeta;
    }

    public async Task<MeasurementDto> AddMeasurement(long seriesId, MeasurementAddRequestDto request)
    {
        var series = await _unitOfWork.Series.GetById(seriesId);
        var area = new Measurement
        {
            Series = series,
            Label = request.Label,
            Plane = request.Plane,
            Type = request.Type,
            Slice = request.Slice,
            Vertices = request.Vertices
        };
        await _unitOfWork.Measurements.Add(area);
        await _unitOfWork.CompleteAsync();
        return _mapper.Map<MeasurementDto>(area);
    }

    public async Task UpdateMeasurementLabel(long seriesId, long areaId, MeasurementUpdateLabelRequestDto request)
    {
        var area = await _unitOfWork.Measurements.GetMeasurementById(areaId);
        area.Label = request.Label;
        await _unitOfWork.CompleteAsync();
    }

    public async Task RemoveArea(long seriesId, long areaId)
    {
       _unitOfWork.Measurements.RemoveById(areaId);
       await _unitOfWork.CompleteAsync();
    }

    public async Task<IEnumerable<MeasurementDto>> GetMeasurements(long seriesId)
    {
        var areas = await _unitOfWork.Measurements.GetMeasurementsBySeriesId(seriesId);
        return _mapper.Map<IList<MeasurementDto>>(areas);
    }

    public async Task<FileStreamResult> GetSeriesStream(long seriesId)
    {
        var series = await _unitOfWork.Series.GetById(seriesId);
        var sourceStream = File.Open(series.FilePath, FileMode.OpenOrCreate);
        return new FileStreamResult(sourceStream, "application/octet-stream");
    }
}