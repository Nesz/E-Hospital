namespace DicomParser
{
    public class DicomConstats
    {
        public const uint UndefinedLengthUint16 = 0xFFFFu;
        public const uint UndefinedLengthUint32 = 0xFFFFFFFFu;
        
        public const string PixelData         = "7FE00010";
        public const string SequenceItemStart = "FFFEE000";
        public const string SequenceItemEnd   = "FFFEE00D";
        public const string SequenceEnd       = "FFFEE0DD";
        public const string PatientId         = "00100020";
        public const string StudyDate         = "00080020";
        public const string StudyTime         = "00080030";
        public const string SeriesId          = "0020000E";
        public const string StudyId           = "0020000D";
        public const string InstanceId        = "00200013";
        public const string StudyDescription  = "00081030";
        public const string Modality          = "00080060";
        public const string SeriesDescription = "0008103E";
        public const string SeriesDate        = "00080021";
        public const string SeriesTime        = "00080031";
    }
}