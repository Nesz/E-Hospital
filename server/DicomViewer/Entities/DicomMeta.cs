using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DicomViewer.Entities
{
    public class DicomMeta
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public long Id { get; set; }
        
        public long PatientId { get; set; }
        public string StudyId { get; set; }
        public string SeriesId { get; set; }
        public int InstanceId { get; set; }
        public string MongoId { get; set; }

    }
}