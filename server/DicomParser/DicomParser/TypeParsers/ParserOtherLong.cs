using DicomParser;

namespace ConsoleApp2.types
{
    public class ParserOtherLong : IDataTypeParser
    {
        public override object Parse(ByteStream byteStream, string tag, bool hasType)
        {
            throw new System.NotImplementedException();
        }
    }
}