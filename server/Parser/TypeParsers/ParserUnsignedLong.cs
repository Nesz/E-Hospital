namespace Parser.TypeParsers;

public class ParserUnsignedLong : IDataTypeParser
{
    public override object Parse(ByteStream byteStream, string tag, bool hasType)
    {
        var length = hasType ? byteStream.ReadUInt16() : byteStream.ReadUInt32();

        if (length == 0)
            return null;

        var arrLength = length / 4;
        var arr = new uint[arrLength];
        for (var i = 0; i < arrLength; ++i)
            arr[i] = byteStream.ReadUInt32();
            
        return arr.Length > 1 ? arr : arr[0];
    }
}