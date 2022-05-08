using System;
using Core.Models;
using Microsoft.AspNetCore.Identity;

namespace Core.Entities;

public class User : IdentityUser<long>
{
    public string FirstName { get; set; }
    public string LastName { get; set; }
        
    public DateTime BirthDate { get; set; }
        
    public Gender Gender { get; set; }
    public Role Role { get; set; }
}