using Microsoft.AspNetCore.Identity;

namespace DicomViewer.Entities
{
    public class User : IdentityUser<long>
    {
        public Role Role { get; set; }
    }
}