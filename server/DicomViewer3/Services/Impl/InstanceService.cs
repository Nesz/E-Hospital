using System.IO;
using System.Threading.Tasks;
using DicomViewer3.Dtos;
using DicomViewer3.Entities;
using DicomViewer3.Repositories;
using MongoDB.Bson;

namespace DicomViewer3.Services.Impl
{
    public class InstanceService : IInstanceService
    {

        private readonly IUnitOfWork _unitOfWork;
        private readonly IMongoService _mongoService;

        public InstanceService(IUnitOfWork unitOfWork, IMongoService mongoService)
        {
            _unitOfWork = unitOfWork;
            _mongoService = mongoService;
        }

        public async Task<Stream> GetInstanceStream(long instanceId)
        {
            var instance = await _unitOfWork.Instances.GetInstanceById(instanceId);
            return await _mongoService.DownloadFile(new ObjectId(instance.MongoId));
        }

        public async Task<dynamic> GetInstanceMeta(long instanceId)
        {
            var instance = await _unitOfWork.Instances.GetInstanceById(instanceId);
            return await _mongoService.GetFileMeta(new ObjectId(instance.MongoId));
        }
    }
}