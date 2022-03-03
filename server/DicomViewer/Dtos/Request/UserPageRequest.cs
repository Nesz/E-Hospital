using DicomViewer.Entities;

namespace DicomViewer.Dtos.Request
{
    public class UserPageRequest : PageRequest
    {
        public string RoleFilter { get; set; }
    }
}