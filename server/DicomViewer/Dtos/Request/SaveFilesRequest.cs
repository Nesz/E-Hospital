using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace DicomViewer.Dtos.Request
{
    public class SaveFilesRequest
    {
        [Required]
        [FromRoute]
        public long PatientId { get; set; }
        
        [Required]
       public IFormFile[] Files { get; set; }
    }
}