namespace Parser.TypeParsers;

public class ParserSignedShort : IDataTypeParser
{
    public override object Parse(ByteStream byteStream, string tag, bool hasType)
    {
        var length = hasType ? byteStream.ReadUInt16() : byteStream.ReadUInt32();
            
        if (length == 0)
            return Enumerable.Empty<int>();

        var arrLength = length / 2;
        var arr = new int[arrLength];
        for (var i = 0; i < arrLength; ++i)
            arr[i] = byteStream.ReadInt16();
            
        return arr;
    }
}