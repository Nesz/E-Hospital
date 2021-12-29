using System.ComponentModel.DataAnnotations;

namespace DicomViewer.Entities.Dtos.Request
{
    public class SignInRequestDto
    {
        [Required]
        public string Email { get; }

        [Required]
        public string Password { get; }   
    }
}