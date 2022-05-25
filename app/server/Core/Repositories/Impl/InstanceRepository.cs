using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Core.Data;
using Core.Entities;
using Microsoft.EntityFrameworkCore;

namespace Core.Repositories.Impl;

public class InstanceRepository : IInstanceRepository
{
    private readonly DataContext _context;

    public InstanceRepository(DataContext context)
    {
        _context = context;
    }

    public async Task Add(Instance instance)
    {
        await _context.Instances.AddAsync(instance);
    }

    public async Task<Instance> GetInstanceById(long instanceId)
    {
        return await _context.Instances.FirstOrDefaultAsync(x => x.Id == instanceId);
    }

    public async Task<Instance?> GetPrevious(long instanceId)
    {
        return await _context.Instances.Where(instance => instance.OriginalId < instanceId)
            .OrderByDescending(instance => instance.OriginalId)
            .FirstOrDefaultAsync();
    }

    public async Task<IEnumerable<Instance>> GetAllForSeries(long seriesId)
    {
        return await _context.Instances
            .Where(x => x.Series.Id == seriesId)
            .ToListAsync();
    }
}