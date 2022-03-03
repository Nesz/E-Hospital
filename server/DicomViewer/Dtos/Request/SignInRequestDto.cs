using System.ComponentModel.DataAnnotations;

namespace DicomViewer.Dtos.Request
{
    public class SignInRequestDto
    {
        [Required]
        public string Email { get; set; }

        [Required]
        public string Password { get; set; }   
    }
}