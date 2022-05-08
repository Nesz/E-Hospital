using System.Threading.Tasks;
using Core.Entities;

namespace Core.Repositories;

public interface IInstanceRepository
{

    Task<Instance> GetInstanceById(long instanceId);
    Task Add(Instance instance);
}