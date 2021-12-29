using System.Threading.Tasks;
using DicomViewer.Entities;
using DicomViewer.Entities.Dtos.Request;
using DicomViewer.Entities.Dtos.Response;

namespace DicomViewer.Services
{
    public interface IUserService
    {
        public Task<User> GetById(long id);

        public Task<User> GetByEmail(string email);

        public Task<bool> ExistsByEmail(string email);
        
        public Task<SignUpResponseDto> SignUp(SignUpRequestDto request);

        public Task<SignInResponseDto> SignIn(SignInRequestDto request);
    }
}