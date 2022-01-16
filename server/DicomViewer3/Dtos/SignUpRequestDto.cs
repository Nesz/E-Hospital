using System;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
using DicomViewer3.Models;

namespace DicomViewer3.Dtos
{
    public class SignUpRequestDto
    {
        [Required]
        public string FirstName { get; set; }
        
        [Required]
        public string LastName { get; set; }
        
        [Required]
        public string Email { get; set; }

        [Required]
        public string Password { get; set; }
        
        [Required]
        [JsonConverter(typeof(JsonStringEnumConverter))]
        public Gender Gender { get; set; }
        
        [Required]
        [DataType(DataType.Date)]
        [DisplayFormat(ApplyFormatInEditMode = true, DataFormatString = "{YYYY-MM-DD}")]
        public DateTime BirthDate { get; set; }
        
        [Required]
        public string PhoneNumber { get; set; }
    }
}