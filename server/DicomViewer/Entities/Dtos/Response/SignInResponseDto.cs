namespace DicomViewer.Entities.Dtos.Response
{
    public class SignInResponseDto
    {
        public User User { get; set; }
        public string Token { get; set; }
    }
}