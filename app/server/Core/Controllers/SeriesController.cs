using System.Collections.Generic;
using System.IO;
using System.Net.Http;
using System.Threading.Tasks;
using Core.Dtos;
using Core.Entities;
using Core.Models;
using Core.Services;
using Microsoft.AspNetCore.Mvc;

namespace Core.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SeriesController
{

    private readonly ISeriesService _seriesService;

    public SeriesController(ISeriesService seriesService)
    {
        _seriesService = seriesService;
    }

    [HttpGet("{patientId:long}")]
    public async Task<Page<SeriesDto>> GetSeriesPaged([FromRoute] long patientId, [FromQuery] PageRequestDto request)
    {
        return await _seriesService.GetSeriesPaged(patientId, request);
    }
        
    [HttpGet("{patientId:long}/{seriesId:long}")]
    public async Task<SeriesDto> GetSeriesByPatientAndSeriesId([FromRoute] long patientId, [FromRoute] long seriesId)
    {
        return await _seriesService.GetSeriesByPatientAndSeriesId(patientId, seriesId);
    }
    
    [HttpGet("{seriesId:long}/meta")]
    public async Task<dynamic> GetInstanceMetaForSeries([FromRoute] long seriesId)
    {
        return await _seriesService.GetInstanceMetaForSeries(seriesId);
    }
        
    [HttpPost("{seriesId:long}/measurement")]
    public async Task<MeasurementDto> AddMeasurement([FromRoute] long seriesId, [FromBody] MeasurementAddRequestDto request)
    {
        return await _seriesService.AddMeasurement(seriesId, request);
    }
        
    [HttpDelete("{seriesId:long}/measurement/{measurementId:long}")]
    public async Task RemoveMeasurement([FromRoute] long seriesId, [FromRoute] long measurementId)
    {
        await _seriesService.RemoveArea(seriesId, measurementId);
    }
    
    [HttpPatch("{seriesId:long}/measurement/{measurementId:long}")]
    public async Task UpdateMeasurementLabel([FromRoute] long seriesId, [FromRoute] long measurementId, [FromBody] MeasurementUpdateLabelRequestDto request)
    {
        await _seriesService.UpdateMeasurementLabel(seriesId, measurementId, request);
    }
    
    [HttpGet("{seriesId:long}/measurement")]
    public async Task<IEnumerable<MeasurementDto>> GetMeasurements([FromRoute] long seriesId)
    {
        return await _seriesService.GetMeasurements(seriesId);
    }
    
    [HttpGet("{seriesId:long}/stream")]
    public async Task<FileStreamResult> GetSeriesStream([FromRoute] long seriesId)
    {
        return await _seriesService.GetSeriesStream(seriesId);
    }
}