using System.Collections.Generic;

namespace DicomViewer.Dtos
{
    public class SerieDto
    {
        public string PatientId { get; set; }
        
        public string StudyId { get; set; }
        
        public string SeriesId { get; set; }
        
        public int InstancesCount { get; set; }
        
        public List<int> Instances { get; set; }
    }
}