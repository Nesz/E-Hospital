using DicomParser;

namespace ConsoleApp2.types
{
    public class ParserAgeString : IDataTypeParser
    {
        public override object Parse(ByteStream byteStream, string tag, bool hasType)
        {
            var length = hasType ? byteStream.ReadUInt16() : byteStream.ReadUInt32();
            var data = byteStream.ReadString(length);
            return data;
        }
    }
}