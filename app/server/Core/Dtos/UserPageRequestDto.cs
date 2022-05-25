using Core.Models;

namespace Core.Dtos;

public class UserPageRequestDto : PageRequestDto
{
    public string KeyFilter { get; set; }
    public Role? RoleFilter { get; set; }
}