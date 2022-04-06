using System.Collections.Generic;
using System.Threading.Tasks;
using Core.Dtos;
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
        
    [HttpPost("{seriesId:long}/area")]
    public async Task AddArea([FromRoute] long seriesId, [FromBody] AreaAddRequestDto request)
    {
        await _seriesService.AddArea(seriesId, request);
    }
        
    [HttpDelete("{seriesId:long}/area/{areaId:long}")]
    public async Task RemoveArea([FromRoute] long seriesId, [FromRoute] long areaId, [FromBody] AreaAddRequestDto request)
    {
        await _seriesService.AddArea(seriesId, request);
    }
        
    [HttpGet("{seriesId:long}/area")]
    public async Task<IEnumerable<AreaDto>> GetAreas([FromRoute] long seriesId)
    {
        return await _seriesService.GetAreas(seriesId);
    }
        
}