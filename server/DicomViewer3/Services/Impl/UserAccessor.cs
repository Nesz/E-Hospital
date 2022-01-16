using System.Linq;
using System.Security.Claims;
using Microsoft.AspNetCore.Http;

namespace DicomViewer3.Services.Impl
{
    public class UserAccessor : IUserAccessor
    {
        private readonly IHttpContextAccessor _httpContextAccessor;

        public UserAccessor(IHttpContextAccessor httpContextAccessor)
        {
            _httpContextAccessor = httpContextAccessor;
        }

        public long GetUserId()
        {
            var id = _httpContextAccessor?
                .HttpContext?
                .User
                .Claims
                .FirstOrDefault(o => o.Type == ClaimTypes.NameIdentifier)?
                .Value;
            return long.Parse(id);
        }
    }
}