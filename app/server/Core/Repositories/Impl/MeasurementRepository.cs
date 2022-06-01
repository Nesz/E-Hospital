using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Core.Data;
using Core.Entities;
using Microsoft.EntityFrameworkCore;

namespace Core.Repositories.Impl;

public class MeasurementRepository : IMeasurementRepository
{
    private readonly DataContext _context;

    public MeasurementRepository(DataContext context)
    {
        _context = context;
    }

    public async Task Add(Measurement measurement)
    {
        await _context.Measurements.AddAsync(measurement);
    }

    public void RemoveById(long id)
    {
        var area = new Measurement { Id = id };
        _context.Measurements.Attach(area);
        _context.Measurements.Remove(area);
    }

    public async Task<IEnumerable<Measurement>> GetMeasurementsBySeriesId(long seriesId)
    {
        return await _context.Measurements
            .Where(x => x.Series.Id == seriesId)
            .ToListAsync();
    }

    public async Task<Measurement> GetMeasurementById(long id)
    {
        return await _context.Measurements
            .FirstAsync(x => x.Id == id);
    }
}