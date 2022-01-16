using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using DicomViewer3.Data;
using DicomViewer3.Entities;
using Microsoft.EntityFrameworkCore;

namespace DicomViewer3.Repositories.Impl
{
    public class StudyRepository : IStudyRepository
    {
        private readonly DataContext _context;

        public StudyRepository(DataContext context)
        {
            _context = context;
        }

        public async Task<Study> GetById(long id)
        {
            return await _context.Studies.FirstOrDefaultAsync(study => study.Id == id);
        }

        public async Task<Study> GetByOriginalId(string originalId)
        {
            return await _context.Studies.FirstOrDefaultAsync(study => study.OriginalId == originalId);
        }

        public async Task<IEnumerable<Study>> GetAllStudiesByUserId(long userId)
        {
            return await _context.Studies
                .Where(study => study.User.Id == userId)
                .ToListAsync();
        }

        public async Task Add(Study study)
        {
            await _context.Studies.AddAsync(study);
        }
    }
}