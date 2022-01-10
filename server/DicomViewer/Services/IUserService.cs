using System.Collections.Generic;
using System.Threading.Tasks;
using DicomViewer.Dtos;
using DicomViewer.Dtos.Request;
using DicomViewer.Dtos.Response;
using DicomViewer.Entities;

namespace DicomViewer.Services
{
    public interface IUserService
    {
        public Task<User> GetById(long id);

        public Task<User> GetByEmail(string email);

        public Task<bool> ExistsByEmail(string email);
        
        public Task<SignUpResponseDto> SignUp(SignUpRequestDto request);

        public Task<SignInResponseDto> SignIn(SignInRequestDto request);
        
        public Task<UserDto> GetCurrentUser();
        
        public Task<Page<UserDto>> GetPatientsList(PageRequest request);
    }
}