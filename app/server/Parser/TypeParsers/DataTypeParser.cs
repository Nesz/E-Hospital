namespace Parser.TypeParsers;

public abstract class IDataTypeParser
{

    public abstract object Parse(ByteStream byteStream, string tag, bool hasType);
        
}