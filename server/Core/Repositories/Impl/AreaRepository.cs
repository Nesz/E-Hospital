using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Core.Data;
using Core.Entities;
using Microsoft.EntityFrameworkCore;

namespace Core.Repositories.Impl;

public class AreaRepository : IAreaRepository
{
    private readonly DataContext _context;

    public AreaRepository(DataContext context)
    {
        _context = context;
    }

    public async Task Add(Area area)
    {
        await _context.Areas.AddAsync(area);
    }

    public void RemoveById(long id)
    {
        var area = new Area { Id = id };
        _context.Areas.Attach(area);
        _context.Areas.Remove(area);
    }

    public async Task<IEnumerable<Area>> GetAreasBySeriesId(long seriesId)
    {
        return await _context.Areas
            .Where(x => x.Series.Id == seriesId)
            .ToListAsync();
    }
}