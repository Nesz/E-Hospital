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
    }
}