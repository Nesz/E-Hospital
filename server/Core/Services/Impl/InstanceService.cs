using System.Threading.Tasks;
using Core.Repositories;

namespace Core.Services.Impl;

public class InstanceService : IInstanceService
{

    private readonly IUnitOfWork _unitOfWork;

    public InstanceService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<dynamic> GetInstanceMeta(long instanceId)
    {
        var instance = await _unitOfWork.Instances.GetInstanceById(instanceId);
        return instance.DicomMeta;
    }
}