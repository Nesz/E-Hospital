using Microsoft.AspNetCore.Identity;

namespace DicomViewer.Entities
{
    public class User : IdentityUser<long>
    {
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public Role Role { get; set; }
    }
}