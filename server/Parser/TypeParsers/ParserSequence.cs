using Parser;
using Parser.TypeParsers;

namespace ConsoleApp2.types;

public class ParserSequence : IDataTypeParser
{

    public override object Parse(ByteStream byteStream, string tag, bool hasType)
    {
        if (hasType)
        {
            byteStream.Skip(2); // skip
        }

        var length = hasType ? byteStream.ReadUInt32() : byteStream.ReadUInt32();
        var list = new List<Dictionary<string, DicomItem>>();
        if (length == 0)
            return list;
            
        var endPositionSection = DicomConstats.UndefinedLengthUint32;
        if (DicomConstats.UndefinedLengthUint32 != length)
            endPositionSection = (uint)byteStream.Position() + length;

        var endPositionItem = DicomConstats.UndefinedLengthUint16;
        var theLength = DicomConstats.UndefinedLengthUint16;
            
        var innerTag = byteStream.ReadTag();

        var dictin = new Dictionary<string, DicomItem>();
        while (true)
        {

            var type = "null";
            if (DicomConstats.SequenceItemStart == innerTag)
                theLength = byteStream.ReadUInt16();
            else
                type = byteStream.ReadString(2);

            object value = null;
            if (innerTag is DicomConstats.SequenceItemStart 
                or DicomConstats.SequenceItemEnd 
                or DicomConstats.SequenceEnd)
            {
                byteStream.ReadBytes(2); // skip
            }
            else
            {
                var parser = DicomParser.GetDefaultParser()
                    .GetParserFor(byteStream, innerTag, type);
                value =  parser.Item1.Parse(byteStream, innerTag, parser.Item2);
            }

            if (DicomConstats.SequenceItemEnd == innerTag || endPositionItem == (uint)byteStream.Position())
            {
                if (DicomConstats.UndefinedLengthUint16 != endPositionItem && endPositionItem != (uint)byteStream.Position())
                    innerTag = byteStream.ReadTag();
                else
                {
                    if (DicomConstats.SequenceItemEnd != innerTag)
                    {
                        var e = new DicomItem(type, value);
                        dictin.Add(innerTag, e);
                    }
                }

                list.Add(dictin);
                dictin = new Dictionary<string, DicomItem>();

                if (endPositionSection == (uint)byteStream.Position())
                    return list;

                innerTag = byteStream.ReadTag();
                continue;
            }
                
            if (DicomConstats.SequenceEnd == innerTag || endPositionSection == (uint)byteStream.Position())
            {
                //_stream.Skip(2);
                return list;
            }

            if (DicomConstats.SequenceItemStart == innerTag)
            {
                if (theLength != DicomConstats.UndefinedLengthUint16)
                    endPositionItem = (uint)byteStream.Position() + theLength;
                innerTag = byteStream.ReadTag();
                continue; 
            }
                
            var entry = new DicomItem(type, value);
            dictin.Add(innerTag, entry);

            innerTag = byteStream.ReadTag();
        }
    }
}