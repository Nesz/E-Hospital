using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;
using DicomParser;
using DicomViewer.Entities;
using Microsoft.AspNetCore.Http;
using MongoDB.Bson;

namespace DicomViewer.Services
{
    public interface IDicomService
    {
        public Task<IEnumerable<DicomMeta>> GetList();
        
        public Task SaveDicom(Dicom dicom, string filename);

        public Task<dynamic> GetMetadata(ObjectId id);

        public Task<Stream> GetFrameStream(ObjectId id);

        public Task SaveFiles(IEnumerable<IFormFile> files);

        public Task<dynamic> GetSeriesMetadata(string studyId, string seriesId);
        
        public Task<Stream> GetFrameData(string studyId, string seriesId, int instanceId);
        
        public Task<dynamic> GetFrameMetadata(string studyId, string seriesId, int instanceId);

    }
}