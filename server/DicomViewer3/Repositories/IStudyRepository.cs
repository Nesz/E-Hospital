using System.Collections.Generic;
using System.Threading.Tasks;
using DicomViewer3.Entities;

namespace DicomViewer3.Repositories
{
    public interface IStudyRepository
    {
        Task<Study> GetById(long id);
        Task<Study> GetByOriginalId(string originalId);
        Task<IEnumerable<Study>> GetAllStudiesByUserId(long userId);
        Task Add(Study study);
    }
}