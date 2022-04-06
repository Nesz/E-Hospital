using System.Collections.Generic;
using System.Threading.Tasks;
using Core.Dtos;
using Core.Models;

namespace Core.Services;

public interface ISeriesService
{
    Task<Page<SeriesDto>> GetSeriesPaged(long patientId, PageRequestDto request);
    Task<SeriesDto> GetSeriesByPatientAndSeriesId(long patientId, long seriesId);
    Task AddArea(long seriesId, AreaAddRequestDto request);
    Task<IEnumerable<AreaDto>> GetAreas(long seriesId);
}