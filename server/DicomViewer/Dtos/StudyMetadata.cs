using System;

namespace DicomViewer.Dtos
{
    public class StudyMetadata
    {
        public long PatientId { get; set; }
        public string StudyId { get; set; }
        public string StudyDescription { get; set; }
        public DateTime StudyDate { get; set; }
        public string Modality { get; set; }
        public long InstancesCount { get; set; }
    }
}