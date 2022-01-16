using System.Collections.Generic;
using System.Threading.Tasks;
using DicomViewer3.Dtos;
using DicomViewer3.Models;
using DicomViewer3.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace DicomViewer3.Controllers
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

        [HttpPost("{patientId:long}")]
        public async Task UploadDicom([FromRoute] long patientId, [FromForm] IFormFile[] files)
        {
            await _dicomService.SaveFiles(patientId, files);
        }

    }
}