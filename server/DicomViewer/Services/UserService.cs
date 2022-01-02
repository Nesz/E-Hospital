using System;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Net;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using AutoMapper;
using DicomViewer.Data;
using DicomViewer.Dtos;
using DicomViewer.Entities;
using DicomViewer.Entities.Dtos.Request;
using DicomViewer.Entities.Dtos.Response;
using DicomViewer.Exceptions;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace DicomViewer.Services
{
    public class UserService : IUserService
    {
        private readonly IMapper _mapper;
        private readonly DataContext _dataContext;
        private readonly IUserAccessor _userAccessor;
        private readonly IConfiguration _configuration;
        private readonly IPasswordHasher<User> _passwordHasher;

        public UserService(
            DataContext dataContext, 
            IUserAccessor userAccessor, 
            IConfiguration configuration, 
            IPasswordHasher<User> passwordHasher,
            IMapper mapper
        ) {
            _mapper = mapper;
            _dataContext = dataContext;
            _userAccessor = userAccessor;
            _configuration = configuration;
            _passwordHasher = passwordHasher;
        }
        
        public async Task<User> GetById(long id)
        {
            var user = await _dataContext.Users
                .Where(e => e.Id == id)
                .SingleOrDefaultAsync();
            
            if (user == null)
                throw new RestException(HttpStatusCode.NotFound, new { Error = "User not found" });

            return user;
        }

        public async Task<User> GetByEmail(string email)
        {
            var user = await _dataContext.Users
                .Where(e => e.Email == email)
                .SingleOrDefaultAsync();
            
            if (user == null)
                throw new RestException(HttpStatusCode.NotFound, new { Error = "User not found" });

            return user;
        }
        
        public async Task<bool> ExistsByEmail(string email)
        {
            var user = await _dataContext.Users
                .Where(e => e.Email == email)
                .SingleOrDefaultAsync();

            return user != null;
        }

        public async Task<UserDto> GetCurrentUser()
        {
            var user = await GetById(_userAccessor.GetUserId());
            return _mapper.Map<UserDto>(user);
        }

        public async Task<SignUpResponseDto> SignUp(SignUpRequestDto request)
        {
            var alreadyExists = await ExistsByEmail(request.Email);
            if (alreadyExists)
                throw new RestException(HttpStatusCode.Conflict, new { Error = "User with this email already exists" });
            
            var user = new User
            {
                Email = request.Email,
                Role = Role.PATIENT
            };
            
            user.PasswordHash = _passwordHasher.HashPassword(user, request.Password);

            await _dataContext.Users.AddAsync(user);
            await _dataContext.SaveChangesAsync();

            return new SignUpResponseDto
            {
                User = _mapper.Map<UserDto>(user),
                Token = GenerateJwtToken(user)
            };
        }
        
        public async Task<SignInResponseDto> SignIn(SignInRequestDto request)
        {
            var user = await GetByEmail(request.Email);
            if (user == null)
                throw new RestException(HttpStatusCode.Unauthorized, new { Error = "Invalid Credentials"});

            var result = _passwordHasher.VerifyHashedPassword(user, user.PasswordHash, request.Password);
            if (PasswordVerificationResult.Failed == result)
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