using System.ComponentModel.DataAnnotations;

namespace Core.Dtos;

public class SignInRequestDto
{
    [Required]
    public string Email { get; set; }

    [Required]
    public string Password { get; set; }   
}