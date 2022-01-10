using System.ComponentModel.DataAnnotations;

namespace DicomViewer.Dtos.Request
{
    public class SignUpRequestDto
    {
        [Required]
        public string FirstName { get; set; }
        
        [Required]
        public string LastName { get; set; }
        
        [Required]
        public string Email { get; set; }

        [Required]
        public string Password { get; set; }
    }
}