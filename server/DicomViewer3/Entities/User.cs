using System;
using DicomViewer3.Models;
using Microsoft.AspNetCore.Identity;

namespace DicomViewer3.Entities
{
    public class User : IdentityUser<long>
    {
        public string FirstName { get; set; }
        public string LastName { get; set; }
        
        public DateTime BirthDate { get; set; }
        
        public Gender Gender { get; set; }
        public Role Role { get; set; }
    }
}