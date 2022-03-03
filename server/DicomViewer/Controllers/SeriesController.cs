using System.Threading.Tasks;
using DicomViewer.Dtos.Request;
using DicomViewer3.Dtos;
using DicomViewer3.Services;
using Microsoft.AspNetCore.Mvc;

namespace DicomViewer.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SeriesController
    {
        
        private readonly IDicomService _dicomService;

        public DicomController(IDicomService dicomService)
        {
            _dicomService = dicomService;
        }
        
        [HttpGet("{patientId:long}")]
        public async Task<Page<SeriesDto>> GetSeriesList([FromRoute] long patientId, [FromQuery] PageRequest request)
        {
            return await _dicomService.GetSeriesList(patientId, request);
        }
    }
}