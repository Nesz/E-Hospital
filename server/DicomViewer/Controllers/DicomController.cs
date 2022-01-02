using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;
using DicomViewer.Entities;
using DicomViewer.Entities.Dtos.Request;
using DicomViewer.Services;
using Microsoft.AspNetCore.Http;
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

        [HttpGet]
        public async Task<IEnumerable<DicomMeta>> GetDicomList()
        {
           return await _dicomService.GetList();
        }

        [HttpGet("{patientId}/{studyId}/{seriesId}/{instanceId:int}/frame")]
        public async Task<Stream> GetFrameInstance([FromRoute] SliceRequest request)
        {
            return await _dicomService.GetSliceData(request);
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

        [HttpPost]
        public async Task UploadDicom([FromForm(Name = "file[]")] IFormFile[] files)
        {
            await _dicomService.SaveFiles(files);
        }
        
    }
}