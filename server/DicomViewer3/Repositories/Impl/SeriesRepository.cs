using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using DicomViewer3.Data;
using DicomViewer3.Entities;
using DicomViewer3.Models;
using Microsoft.EntityFrameworkCore;

namespace DicomViewer3.Repositories.Impl
{
    public class SeriesRepository : ISeriesRepository
    {
        private readonly DataContext _context;

        public SeriesRepository(DataContext context)
        {
            _context = context;
        }

        public async Task<Series> GetById(long id)
        {
            return await _context.Series.FirstOrDefaultAsync(series => series.Id == id);
        }

        public async Task<Series> GetByOriginalId(string originalId)
        {
            return await _context.Series.FirstOrDefaultAsync(series => series.OriginalId == originalId);
        }

        public async Task Add(Series series)
        {
            await _context.Series.AddAsync(series);
        }

        public async Task<Series> GetSeriesByPatientAndSeriesId(long patientId, long seriesId)
        {
            return await _context.Series
                .Where(x => x.Study.User.Id == patientId && x.Id == seriesId)
                .Include(x => x.Study)
                .Include(x => x.Instances)
                .FirstOrDefaultAsync();
        }

        public async Task<Page<Series>> GetInstancesForPatientId(
            long patientId,
            int pageNumber,
            int pageSize,
            Func<IQueryable<Series>, IQueryable<Series>> filter = null, 
            Func<IQueryable<Series>, IQueryable<Series>> sort = null)
        {
            filter ??= x => x;
            sort ??= x => x;

            var baseFilter = _context.Series
                .Where(x => x.Study.User.Id == patientId);

            var seriesFiltered = filter.Invoke(baseFilter);
            var usersCount = await seriesFiltered.CountAsync();
            var seriesSorted = sort.Invoke(seriesFiltered);
            var seriesPaged = await seriesSorted
                .Skip(pageSize * (pageNumber - 1))
                .Take(pageSize)
                .Include(x => x.Study)
                .Include(x => x.Instances)
                .ToListAsync();

            
            return new Page<Series>
            {
                PageTotal = (int) Math.Ceiling(usersCount / (double) pageSize),
                PageCurrent = pageNumber,
                PageSize = pageSize,
                Data = seriesPaged
            };
        }
    }
}