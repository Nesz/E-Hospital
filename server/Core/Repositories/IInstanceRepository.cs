#nullable enable
using System.Collections;
using System.Collections.Generic;
using System.Threading.Tasks;
using Core.Entities;

namespace Core.Repositories;

public interface IInstanceRepository
{

    Task<Instance> GetInstanceById(long instanceId);
    Task<Instance?> GetPrevious(long instanceId);
    Task Add(Instance instance);
    Task<IEnumerable<Instance>> GetAllForSeries(long seriesId);
}