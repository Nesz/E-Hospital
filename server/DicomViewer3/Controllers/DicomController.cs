using System;
using System.Collections.Generic;
using System.Text.Json;
using System.Threading.Tasks;
using DicomViewer3.Dtos;
using DicomViewer3.Helpers;
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
            var generatedGuid = Guid.NewGuid();
            HttpContext.Response.StatusCode = 202;
            await HttpContext.Response.WriteAsync(JsonSerializer.Serialize(new
            {
                id = generatedGuid
            }));
            
            await HttpContext.Response.CompleteAsync();
            await _dicomService.SaveFiles(patientId, files, generatedGuid);
            //return Task.FromResult(new
            //{
            //    id = genereatedGuid
            //});
        }

    }
}