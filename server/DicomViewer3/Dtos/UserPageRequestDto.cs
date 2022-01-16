using DicomViewer3.Models;

namespace DicomViewer3.Dtos
{
    public class UserPageRequestDto : PageRequestDto
    {
        public string KeyFilter { get; set; }
        public Role? RoleFilter { get; set; }
    }
}