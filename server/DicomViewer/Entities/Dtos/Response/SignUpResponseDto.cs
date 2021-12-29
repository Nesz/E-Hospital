using DicomViewer.Dtos;

namespace DicomViewer.Entities.Dtos.Response
{
    public class SignUpResponseDto
    {
        public UserDto User { get; set; }
        public string Token { get; set; }
    }
}