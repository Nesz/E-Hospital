using System.Threading.Tasks;
using Core.Dtos;
using Core.Models;

namespace Core.Services;

public interface IUserService
{
    Task<UserDto> GetById(long id);
    Task<UserDto> GetByEmail(string email);
    Task<UserDto> GetCurrentUser();
    Task<Page<UserDto>> GetAllPaged(UserPageRequestDto request);
    Task<SignUpResponseDto> SignUp(SignUpRequestDto request);
    Task<SignInResponseDto> SignIn(SignInRequestDto request);
}