using System.Collections.Generic;
using System.Threading.Tasks;
using Core.Entities;

namespace Core.Repositories;

public interface IAreaRepository
{
    Task Add(Area area);
    void RemoveById(long id);
    Task<IEnumerable<Area>> GetAreasBySeriesId(long seriesId);
    Task<Area> GetAreaById(long id);
}