using System.Globalization;

namespace Parser.TypeParsers;

public class ParserTime : IDataTypeParser
{
    public override object Parse(ByteStream byteStream, string tag, bool hasType)
    {
        var length = hasType ? byteStream.ReadUInt16() : byteStream.ReadUInt32();
        var timeString = byteStream.ReadString(length).Trim();

        if (string.IsNullOrWhiteSpace(timeString))
        {
            return TimeSpan.Zero;
        }
            
        var format = timeString.Contains(".") ? @"hmmss\.FFFFFF" : "hmmss";
            
        return TimeSpan.ParseExact(timeString, format, CultureInfo.InvariantCulture);
    }
}