using System.Collections.Generic;
using DicomParser;

namespace ConsoleApp2.types
{
    public class ParserOtherWord : IDataTypeParser
    {
        public override object Parse(ByteStream byteStream, string tag, bool hasType)
        {
            if (hasType)
                byteStream.Skip(2); // skip
            var length = hasType ? byteStream.ReadUInt32() : byteStream.ReadUInt32();
            
            if (DicomConstats.PixelData == tag)
                return new List<byte[]> { byteStream.ReadBytes(length) };

            var arrSize = length / 2;
            var arr = new int[arrSize];
            for (var i = 0; i < arrSize; ++i)
                arr[i] = byteStream.ReadInt16();

            return arr;
            
            //return System.Text.Encoding.Default.GetString(byteStream.ReadBytes(length));
        }
    }
}