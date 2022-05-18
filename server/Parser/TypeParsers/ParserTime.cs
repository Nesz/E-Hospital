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
            
        
        
        if (timeString.Contains("\\"))
        {
            return timeString.Split("\\")
                .Select(x => x.Trim())
                .Select(x =>
                {
                    var format = timeString.Contains(".") ? @"hmmss\.FFFFFF" : "hmmss";
                    return TimeSpan.ParseExact(x, format, CultureInfo.InvariantCulture);
                }).ToList();
        }

        var format = timeString.Contains(".") ? @"hmmss\.FFFFFF" : "hmmss";
        return TimeSpan.ParseExact(timeString, format, CultureInfo.InvariantCulture);
    }
}