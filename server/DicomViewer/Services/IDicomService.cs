using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;
using DicomParser;
using DicomViewer.Entities;
using DicomViewer.Entities.Dtos.Request;
using Microsoft.AspNetCore.Http;
using MongoDB.Bson;

namespace DicomViewer.Services
{
    public interface IDicomService
    {
        public Task<IEnumerable<DicomMeta>> GetList();

        public Task<dynamic> GetMetadata(ObjectId id);

        public Task SaveFiles(IEnumerable<IFormFile> files);

        public Task<dynamic> GetSeriesMetadata(SeriesMetadataRequest request);
        
        public Task<Stream> GetSliceData(SliceRequest request);
        
        public Task<dynamic> GetSliceMetadata(SliceMetadataRequest request);

    }
}