namespace DicomViewer.Dtos.Response
{
    public class SignInResponseDto
    {
        public UserDto User { get; set; }
        public string Token { get; set; }
    }
}