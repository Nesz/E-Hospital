using DicomParser;

namespace ConsoleApp2.types
{
    public abstract class IDataTypeParser
    {

        public abstract object Parse(ByteStream byteStream, string tag, bool hasType);
        
    }
}