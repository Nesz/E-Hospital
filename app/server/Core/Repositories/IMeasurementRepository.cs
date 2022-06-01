using System.Collections.Generic;
using System.Threading.Tasks;
using Core.Entities;

namespace Core.Repositories;

public interface IMeasurementRepository
{
    Task Add(Measurement measurement);
    void RemoveById(long id);
    Task<IEnumerable<Measurement>> GetMeasurementsBySeriesId(long seriesId);
    Task<Measurement> GetMeasurementById(long id);
}