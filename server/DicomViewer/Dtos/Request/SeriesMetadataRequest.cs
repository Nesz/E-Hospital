using System.ComponentModel.DataAnnotations;

namespace DicomViewer.Dtos.Request
{
    public class SeriesMetadataRequest
    {
        [Required]
        public long PatientId { get; set; }
        
        [Required]
        public string StudyId { get; set; }
        
        [Required]
        public string SeriesId { get; set; }
    }
}