using System.Threading.Tasks;
using Core.Dtos;
using Core.Models;
using Core.Services;
using Microsoft.AspNetCore.Mvc;

namespace Core.Controllers;

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
    public async Task<UserDto> GetCurrentUser()
    {
        return await _userService.GetCurrentUser();
    }
        
    [HttpGet("{patientId:long}")]
    public async Task<UserDto> GetUser([FromRoute] long patientId)
    {
        return await _userService.GetById(patientId);
    }
        
    [HttpGet]
    public async Task<Page<UserDto>> GetUsersPaged([FromQuery] UserPageRequestDto request)
    {
        return await _userService.GetAllPaged(request);
    }
}