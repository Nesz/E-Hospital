using System.Collections.Generic;
using System.IO;
using System.Net.Http;
using System.Threading.Tasks;
using Core.Dtos;
using Core.Entities;
using Core.Models;
using Microsoft.AspNetCore.Mvc;

namespace Core.Services;

public interface ISeriesService
{
    Task<Page<SeriesDto>> GetSeriesPaged(long patientId, PageRequestDto request);
    Task<SeriesDto> GetSeriesByPatientAndSeriesId(long patientId, long seriesId);
    Task<MeasurementDto> AddMeasurement(long seriesId, MeasurementAddRequestDto request);
    Task<IEnumerable<MeasurementDto>> GetMeasurements(long seriesId);
    Task RemoveArea(long seriesId, long areaId);
    Task UpdateMeasurementLabel(long seriesId, long areaId, MeasurementUpdateLabelRequestDto request);
    Task<FileStreamResult> GetSeriesStream(long seriesId);
    Task<dynamic> GetInstanceMetaForSeries(long seriesId);
}