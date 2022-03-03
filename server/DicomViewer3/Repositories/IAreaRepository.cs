using System.Collections;
using System.Collections.Generic;
using System.Threading.Tasks;
using DicomViewer3.Entities;

namespace DicomViewer3.Repositories
{
    public interface IAreaRepository
    {
        Task Add(Area area);
        void RemoveById(long id);
        Task<IEnumerable<Area>> GetAreasBySeriesId(long seriesId);
    }
}