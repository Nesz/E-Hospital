using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using MongoDB.Bson;
using MongoDB.Driver;
using MongoDB.Driver.GridFS;

namespace Core.Services.Impl;

public class MongoService : IMongoService
{

    private readonly GridFSBucket _bucket;
        
    public MongoService(IConfiguration configuration)
    {
        var client = new MongoClient(configuration.GetConnectionString("MongoConnection"));
        var database = client.GetDatabase(configuration.GetConnectionString("MongoDatabase"));

        _bucket = new GridFSBucket(database, new GridFSBucketOptions
        {
            BucketName = "frames",
            ChunkSizeBytes = 1048576, // 1MB
            WriteConcern = WriteConcern.Unacknowledged,
            ReadPreference = ReadPreference.Primary
        });
    }

    public GridFSBucket GetFsBucket()
    {
        return _bucket;
    }

    public async Task<ObjectId> UploadFile(string filename, byte[] data, GridFSUploadOptions options = null)
    {
        return await _bucket.UploadFromBytesAsync(filename, data, options);
    }

    public async Task<GridFSDownloadStream> DownloadFile(ObjectId id)
    {
        return await _bucket.OpenDownloadStreamAsync(id);
    }

    public async Task<dynamic> GetFileMeta(ObjectId id)
    {
        var filter = Builders<GridFSFileInfo>.Filter.Eq("_id", id);
        var results = await _bucket.FindAsync(filter);
        return results.First().Metadata.ToDictionary();
    }
}