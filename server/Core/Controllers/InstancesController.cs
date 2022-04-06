using System.IO;
using System.Threading.Tasks;
using Core.Services;
using Microsoft.AspNetCore.Mvc;

namespace Core.Controllers;

[ApiController]
[Route("api/[controller]")]
public class InstancesController
{

    private readonly IInstanceService _instanceService;

    public InstancesController(IInstanceService instanceService)
    {
        _instanceService = instanceService;
    }
        
    [HttpGet("{instanceId:long}")]
    public async Task<Stream> GetInstanceStream([FromRoute] long instanceId)
    {
        return await _instanceService.GetInstanceStream(instanceId);
    }
        
    [HttpGet("{instanceId:long}/meta")]
    public async Task<dynamic> GetInstanceMeta([FromRoute] long instanceId)
    {
        return await _instanceService.GetInstanceMeta(instanceId);
    }
        
}