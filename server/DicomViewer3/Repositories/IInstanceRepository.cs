using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;
using DicomViewer3.Entities;

namespace DicomViewer3.Repositories
{
    public interface IInstanceRepository
    {

        Task<Instance> GetInstanceById(long instanceId);
        Task Add(Instance instance);
    }
}