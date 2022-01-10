using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;
using DicomViewer.Dtos.Request;
using DicomViewer.Entities;
using DicomViewer.Services;
using Microsoft.AspNetCore.Mvc;

namespace DicomViewer.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [DisableRequestSizeLimit]
    public class DicomController : ControllerBase
    {
        
        private readonly IDicomService _dicomService;

        public DicomController(IDicomService dicomService)
        {
            _dicomService = dicomService;
        }

        [HttpGet("{patientId:long}")]
        public async Task<IEnumerable<DicomMeta>> GetDicomList(long patientId)
        {
           return await _dicomService.GetFilesMetadata(patientId);
        }

        [HttpGet("{patientId}/{studyId}/{seriesId}/{instanceId:int}/frame")]
        public async Task<Stream> GetSlice([FromRoute] SliceRequest request)
        {
            return await _dicomService.GetSlice(request);
        }

        [HttpGet("{patientId}/{studyId}/{seriesId}/{instanceId:int}/meta")]
        public async Task<dynamic> GetSliceMetadata([FromRoute] SliceMetadataRequest request)
        {
            return await _dicomService.GetSliceMetadata(request);
        }
        
        [HttpGet("{patientId}/{studyId}/{seriesId}")]
        public async Task<dynamic> GetSeriesMetadata([FromRoute] SeriesMetadataRequest request)
        {
            return await _dicomService.GetSeriesMetadata(request);
        }

        [HttpPost("{patientId}")]
        public async Task UploadDicom([FromForm] SaveFilesRequest request)
        {
            await _dicomService.SaveFiles(request);
        }
        
    }
}