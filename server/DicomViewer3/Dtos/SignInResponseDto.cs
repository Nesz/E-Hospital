namespace DicomViewer3.Dtos
{
    public class SignInResponseDto
    {
        public UserDto User { get; set; }
        public string Token { get; set; }
    }
}