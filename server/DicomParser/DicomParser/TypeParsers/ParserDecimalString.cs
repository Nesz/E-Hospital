using DicomParser;

namespace ConsoleApp2.types
{
    public class ParserDecimalString : IDataTypeParser
    {
        public override object Parse(ByteStream byteStream, string tag, bool hasType)
        {
            var length = hasType ? byteStream.ReadUInt16() : byteStream.ReadUInt32();
            var decimals = byteStream.ReadString(length).Split("\\");
            return decimals;
        }
    }
}