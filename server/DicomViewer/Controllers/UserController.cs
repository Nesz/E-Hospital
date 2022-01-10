using System.Collections.Generic;
using System.Threading.Tasks;
using DicomViewer.Dtos;
using DicomViewer.Dtos.Request;
using DicomViewer.Services;
using Microsoft.AspNetCore.Mvc;

namespace DicomViewer.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UserController : ControllerBase
    {
        
        private readonly IUserService _userService;

        public UserController(IUserService userService)
        {
            _userService = userService;
        }
        
        [HttpGet("me")]
        public async Task<UserDto> Me()
        {
            return await _userService.GetCurrentUser();
        }
        
        [HttpGet("patients")]
        public async Task<Page<UserDto>> GetPatientsList([FromQuery] PageRequest request)
        {
            return await _userService.GetPatientsList(request);
        }
    }
}