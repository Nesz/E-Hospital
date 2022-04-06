using System.Threading.Tasks;
using MongoDB.Bson;
using MongoDB.Driver.GridFS;

namespace Core.Services;

public interface IMongoService
{
    GridFSBucket GetFsBucket();

    Task<ObjectId> UploadFile(string filename, byte[] data, GridFSUploadOptions options = null);

    Task<GridFSDownloadStream> DownloadFile(ObjectId id);

    Task<dynamic> GetFileMeta(ObjectId id);
}