using System.Threading.Tasks;
using DicomViewer3.Dtos;
using DicomViewer3.Models;

namespace DicomViewer3.Services
{
    public interface IUserService
    {
        Task<UserDto> GetById(long id);
        Task<UserDto> GetByEmail(string email);
        Task<UserDto> GetCurrentUser();
        Task<Page<UserDto>> GetAllPaged(UserPageRequestDto request);
        Task<SignUpResponseDto> SignUp(SignUpRequestDto request);
        Task<SignInResponseDto> SignIn(SignInRequestDto request);
    }
}