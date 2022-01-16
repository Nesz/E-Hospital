using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DicomViewer3.Entities
{
    public class Study
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public long Id { get; set; }
        public string OriginalId { get; set; }
        public string Description { get; set; }
        public DateTime Date { get; set; }
        public virtual User User { get; set; }
    }
}