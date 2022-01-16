using System;
using System.Globalization;
using DicomParser;

namespace ConsoleApp2.types
{
    public class ParserDateTime : IDataTypeParser
    {
        public override object Parse(ByteStream byteStream, string tag, bool hasType)
        {
            var length = hasType ? byteStream.ReadUInt16() : byteStream.ReadUInt32();
            return byteStream.ReadString(length);
        }
    }
}