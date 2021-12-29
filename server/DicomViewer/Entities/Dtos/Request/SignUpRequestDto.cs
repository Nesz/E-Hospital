using System.ComponentModel.DataAnnotations;

namespace DicomViewer.Entities.Dtos.Request
{
    public class SignUpRequestDto
    {
        [Required]
        public string Email { get; set; }

        [Required]
        public string Password { get; set; }
    }
}