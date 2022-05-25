using System;
using System.Linq;
using System.Threading.Tasks;
using Core.Entities;
using Core.Models;

namespace Core.Repositories;

public interface ISeriesRepository
{
    Task<Series> GetById(long id);
    Task<Series> GetByOriginalId(string originalId);
    Task Add(Series series);

    Task<Page<Series>> GetInstancesForPatientId(
        long patientId,
        int pageNumber,
        int pageSize,
        Func<IQueryable<Series>, IQueryable<Series>> filter = null,
        Func<IQueryable<Series>, IOrderedQueryable<Series>> sort = null);

    Task<Series> GetSeriesByPatientAndSeriesId(long patientId, long seriesId);
}