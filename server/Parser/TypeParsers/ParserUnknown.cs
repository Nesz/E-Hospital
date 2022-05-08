namespace Parser.TypeParsers;

public class ParserUnknown : IDataTypeParser
{
    public override object Parse(ByteStream byteStream, string tag, bool hasType)
    {
        if (hasType)
            byteStream.Skip(2);
        var length = hasType ? byteStream.ReadUInt16() : byteStream.ReadUInt32();
        return byteStream.ReadBytes(length);
    }
}