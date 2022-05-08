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
}