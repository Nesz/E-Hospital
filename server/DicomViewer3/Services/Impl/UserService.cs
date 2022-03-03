using System;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Net;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using AutoMapper;
using DicomViewer3.Dtos;
using DicomViewer3.Entities;
using DicomViewer3.Exceptions;
using DicomViewer3.Helpers;
using DicomViewer3.Models;
using DicomViewer3.Repositories;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace DicomViewer3.Services.Impl
{
    public class UserService : IUserService
    {
        private readonly IPasswordHasher<User> _passwordHasher;
        private readonly IConfiguration _configuration;
        private readonly IUserAccessor _userAccessor;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public UserService(
            IPasswordHasher<User> passwordHasher,
            IConfiguration configuration, 
            IUserAccessor userAccessor, 
            IUnitOfWork unitOfWork, 
            IMapper mapper)
        {
            _passwordHasher = passwordHasher;
            _configuration = configuration;
            _userAccessor = userAccessor;
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<UserDto> GetById(long id)
        {
            var currentUser = await GetCurrentUser();
            var target = await _unitOfWork.Users.GetById(id);

            if (Role.Patient == target.Role && 
                currentUser.Id != target.Id && 
                currentUser.Role is not (Role.Admin or Role.Doctor))
            {
                throw new RestException(HttpStatusCode.Forbidden, new { Error = "You don't have access to this resource" });
            }
            
            return _mapper.Map<UserDto>(target);
        }

        public async Task<UserDto> GetByEmail(string email)
        {
            var currentUser = await GetCurrentUser();
            var target = await _unitOfWork.Users.GetByEmail(email);

            if (Role.Patient == target.Role && 
                currentUser.Id != target.Id && 
                currentUser.Role is not (Role.Admin or Role.Doctor))
            {
                throw new RestException(HttpStatusCode.Forbidden, new { Error = "You don't have access to this resource" });
            }
            
            return _mapper.Map<UserDto>(target);
        }

        public async Task<UserDto> GetCurrentUser()
        {
            var id = _userAccessor.GetUserId();
            var user = await _unitOfWork.Users.GetById(id);
            return _mapper.Map<UserDto>(user);
        }

        public async Task<Page<UserDto>> GetAllPaged(UserPageRequestDto request)
        {
            var currentUser = await GetCurrentUser();
            if (Role.Patient == currentUser.Role)
                throw new RestException(HttpStatusCode.Forbidden, new { Error = "You don't have access to this resource" });

            if (Role.Doctor == currentUser.Role)
            {
                if (request.RoleFilter == null)
                    request.RoleFilter = Role.Patient;
                else if (Role.Patient != request.RoleFilter)
                    throw new RestException(HttpStatusCode.Forbidden, new { Error = "You don't have access to this resource" });
            }

            var page = await _unitOfWork.Users.GetAllPaged(
                request.PageNumber,
                request.PageSize,
                x => x
                    .If(() => request.RoleFilter != null,
                        e => e.Where(user => user.Role == request.RoleFilter)
                    )
                    .If(() => !string.IsNullOrWhiteSpace(request.KeyFilter),
                        e => e.Where(user => 
                            user.Email.ToLower().Contains(request.KeyFilter.ToLower()) ||
                            user.FirstName.ToLower().Contains(request.KeyFilter.ToLower()) ||
                            user.LastName.ToLower().Contains(request.KeyFilter.ToLower())
                        )
                    ),
                x => x.IfThenElse(
                    () => OrderDirection.Ascending == request.OrderDirection,
                    e => e.OrderBy(user => EF.Property<User>(user, request.PageOrder)),
                    e => e.OrderByDescending(user => EF.Property<User>(user, request.PageOrder))
                )
            );
            return _mapper.Map<Page<UserDto>>(page);
        }

        public async Task<SignUpResponseDto> SignUp(SignUpRequestDto request)
        {
            var alreadyExists = await _unitOfWork.Users.ExistsByEmail(request.Email);
            if (alreadyExists)
                throw new RestException(HttpStatusCode.Conflict, new { Error = "User with this email already exists" });
            
            var user = new User
            {
                FirstName = request.FirstName,
                LastName = request.LastName,
                Email = request.Email,
                Role = Role.Patient,
                Gender = request.Gender,
                BirthDate = request.BirthDate,
                PhoneNumber = request.PhoneNumber
            };
            
            user.PasswordHash = _passwordHasher.HashPassword(user, request.Password);

            await _unitOfWork.Users.Add(user);
            await _unitOfWork.CompleteAsync();

            return new SignUpResponseDto
            {
                User = _mapper.Map<UserDto>(user),
                Token = GenerateJwtToken(user)
            };
        }
        
        public async Task<SignInResponseDto> SignIn(SignInRequestDto request)
        {
            var user = await _unitOfWork.Users.GetByEmail(request.Email);
            if (user == null)
                throw new RestException(HttpStatusCode.Unauthorized, new { Error = "Invalid Credentials"});

            var verificationResult = _passwordHasher.VerifyHashedPassword(user, user.PasswordHash, request.Password);
            if (PasswordVerificationResult.Failed == verificationResult)
                throw new RestException(HttpStatusCode.Unauthorized, new { Error = "Invalid Credentials" });

            return new SignInResponseDto 
            {
                User = _mapper.Map<UserDto>(user),
                Token = GenerateJwtToken(user)
            };
        }
        
        private string GenerateJwtToken(User user)
        {
            var key = Encoding.ASCII.GetBytes(_configuration["Secret"]);
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[] { new Claim(JwtRegisteredClaimNames.NameId, user.Id.ToString()) }),
                Expires = DateTime.UtcNow.AddDays(7),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };
            var tokenHandler = new JwtSecurityTokenHandler();
            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }
    }
}