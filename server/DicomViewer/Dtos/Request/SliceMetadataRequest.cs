using System.ComponentModel.DataAnnotations;

namespace DicomViewer.Dtos.Request
{
    public class SliceMetadataRequest
    {
        [Required]
        public long PatientId { get; set; }
        
        [Required]
        public string StudyId { get; set; }
        
        [Required]
        public string SeriesId { get; set; }
        
        [Required]
        public int InstanceId { get; set; }
    }
}