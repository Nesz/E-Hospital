namespace Parser.TypeParsers;

public class ParserIntegerString : IDataTypeParser
{
    public override object Parse(ByteStream byteStream, string tag, bool hasType)
    {
        var length = hasType ? byteStream.ReadUInt16() : byteStream.ReadUInt32();
        var str = byteStream.ReadString(length).Trim();
        if (string.IsNullOrEmpty(str))
            return null;

        if (str.Contains("\\"))
        {
            var split = str.Split("\\");
            return split.Select(uint.Parse).ToArray();
        }

        return int.Parse(str);
    }
}