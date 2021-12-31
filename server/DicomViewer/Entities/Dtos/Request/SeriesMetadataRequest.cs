using System.ComponentModel.DataAnnotations;

namespace DicomViewer.Entities.Dtos.Request
{
    public class SeriesMetadataRequest
    {
        [Required]
        public string PatientId { get; set; }
        
        [Required]
        public string StudyId { get; set; }
        
        [Required]
        public string SeriesId { get; set; }
    }
}