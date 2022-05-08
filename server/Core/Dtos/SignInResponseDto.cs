namespace Core.Dtos;

public class SignInResponseDto
{
    public UserDto User { get; set; }
    public string Token { get; set; }
}