using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;
using DicomViewer.Dtos;
using DicomViewer.Dtos.Request;
using DicomViewer.Entities;

namespace DicomViewer.Services
{
    public interface IDicomService
    {
        public Task<IEnumerable<StudyMetadata>> GetStudiesMetadata(long patientId);

        public Task SaveFiles(SaveFilesRequest request);
        
        public Task<Stream> GetSlice(SliceRequest request);

        public Task<SerieDto> GetSeriesMetadata(SeriesMetadataRequest request);

        public Task<dynamic> GetSliceMetadata(SliceMetadataRequest request);

    }
}