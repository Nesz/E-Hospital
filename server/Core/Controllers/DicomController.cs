using System;
using System.Text.Json;
using System.Threading.Tasks;
using Core.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Core.Controllers;

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