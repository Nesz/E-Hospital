namespace Parser.TypeParsers;

public class ParserUnsignedShort : IDataTypeParser
{
    public override object Parse(ByteStream byteStream, string tag, bool hasType)
    {
        var length = hasType ? byteStream.ReadUInt16() : byteStream.ReadUInt32();

        if (length == 0)
            return null;
                
        var arrLength = length / 2;
        var arr = new ushort[arrLength];
        for (var i = 0; i < arrLength; ++i)
            arr[i] = byteStream.ReadUInt16();
            
        return arr.Length > 1 ? arr : arr[0];
    }
}