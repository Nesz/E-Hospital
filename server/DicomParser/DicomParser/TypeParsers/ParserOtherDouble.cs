using DicomParser;

namespace ConsoleApp2.types
{
    public class ParserOtherDouble : IDataTypeParser
    {
        public override object Parse(ByteStream byteStream, string tag, bool hasType)
        {
            throw new System.NotImplementedException();
        }
    }
}