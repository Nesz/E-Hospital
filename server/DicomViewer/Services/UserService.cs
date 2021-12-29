using System;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Net;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using DicomViewer.Data;
using DicomViewer.Entities;
using DicomViewer.Entities.Dtos.Request;
using DicomViewer.Entities.Dtos.Response;
using DicomViewer.Exceptions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace DicomViewer.Services
{
    public class UserService
    {
        private readonly DataContext _dataContext;
        private readonly IConfiguration _configuration;

        public UserService(DataContext dataContext, IConfiguration configuration)
        {
            _dataContext = dataContext;
            _configuration = configuration;
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
        
        public async Task<SignUpResponseDto> SignUp(SignUpRequestDto request)
        {
            var alreadyExists = await ExistsByEmail(request.Email);
            if (alreadyExists)
                throw new RestException(HttpStatusCode.Conflict, new { Error = "User with this email already exists" });

            var hashedPassword = BCrypt.Net.BCrypt.HashPassword(request.Password);
            var newUser = new User
            {
                Email = request.Email,
                PasswordHash = hashedPassword
            };

            newUser = (await _dataContext.Users.AddAsync(newUser)).Entity;

            return new SignUpResponseDto
            {
                User = newUser,
                Token = GenerateJwtToken(newUser)
            };
        }
        
        public async Task<SignInResponseDto> SignIn(SignInRequestDto request)
        {
            var user = await GetByEmail(request.Email);
            if (user == null)
                throw new RestException(HttpStatusCode.Unauthorized, new { Error = "Invalid Credentials"});

            if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
                throw new RestException(HttpStatusCode.Unauthorized, new { Error = "Invalid Credentials" });

            return new SignInResponseDto 
            {
                User = user,
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