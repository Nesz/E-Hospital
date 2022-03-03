using System.Collections.Generic;
using System.IO;
using System.Linq;
using ConsoleApp2.types;
using DicomParser.TypeParsers;

namespace DicomParser
{
    public class DicomParse
    {

        public static Dictionary<string, string> DEFAULT_ATTRIBS = new Dictionary<string, string>();

        static DicomParse()
        {
            var path = Path.GetFullPath("../DicomParser/DicomParser/attribs.csv");
            var lines = File.ReadAllLines(path);
            foreach (var line in lines)
            {
                var split = line.Split(";");
                var key = split[0] + split[1];
                var val = split[2];
                DEFAULT_ATTRIBS[key.Trim().ToUpper()] = val.Trim().ToUpper();
            }
        }

        private static DicomParse _parser;
        public static DicomParse GetDefaultParser()
        {
            if (_parser is not null)
                return _parser;
            
            _parser = new DicomParse()
                .AddParser(DataType.ApplicationEntity,   new ParserApplicationEntity())
                .AddParser(DataType.AgeString,           new ParserAgeString())
                .AddParser(DataType.AttributeTag,        new ParserAttributeTag())
                .AddParser(DataType.CodeString,          new ParserCodeString())
                .AddParser(DataType.Date,                new ParserDate())
                .AddParser(DataType.DecimalString,       new ParserDecimalString())
                .AddParser(DataType.DateTime,            new ParserDateTime())
                .AddParser(DataType.FloatingPointSingle, new ParserFloatingPointSingle())
                .AddParser(DataType.FloatingPointDouble, new ParserFloatingPointDouble())
                .AddParser(DataType.IntegerString,       new ParserIntegerString())
                .AddParser(DataType.LongString,          new ParserLongString())
                .AddParser(DataType.LongText,            new ParserLongText())
                .AddParser(DataType.OtherByteString,     new ParserOtherByteString())
                .AddParser(DataType.OtherDouble,         new ParserOtherDouble())
                .AddParser(DataType.OtherFloat,          new ParserOtherFloat())
                .AddParser(DataType.OtherLong,           new ParserOtherLong())
                .AddParser(DataType.OtherLong64,         new ParserOtherLong64())
                .AddParser(DataType.OtherWord,           new ParserOtherWord())
                .AddParser(DataType.PersonName,          new ParserPersonName())
                .AddParser(DataType.ShortString,         new ParserShortString())
                .AddParser(DataType.SignedLong,          new SignedLongParser())
                .AddParser(DataType.SequenceOfItems,     new ParserSequence())
                .AddParser(DataType.SignedShort,         new ParserSignedShort())
                .AddParser(DataType.ShortText,           new ParserShortText())
                .AddParser(DataType.Signed64,            new ParserSigned64())
                .AddParser(DataType.Time,                new ParserTime())
                .AddParser(DataType.UnlimitedCharacters, new ParserUnlimitedCharacters())
                .AddParser(DataType.UniqueIdentifier,    new ParserUniqueIdentifier())
                .AddParser(DataType.UnsignedLong,        new ParserUnsignedLong())
                .AddParser(DataType.Unknown,             new ParserUnknown())
                .AddParser(DataType.Uri,                 new ParserUri())
                .AddParser(DataType.UnsignedShort,       new ParserUnsignedShort())
                .AddParser(DataType.UnlimitedText,       new ParserUnlimitedText())
                .AddParser(DataType.Unsigned64,          new ParserUnsigned64());

            return _parser;
        }
        
        private readonly Dictionary<string, IDataTypeParser> _parsers;

        public DicomParse()
        {
            _parsers = new Dictionary<string, IDataTypeParser>();
        }

        public DicomParse AddParser(string vr, IDataTypeParser parser)
        {
            _parsers.Add(vr, parser);
            return this;
        }

        public (IDataTypeParser, bool) GetParserFor(ByteStream stream, string attrib, string vr)
        {
            if (_parsers.ContainsKey(vr))
                return (_parsers[vr], true);
            if (DEFAULT_ATTRIBS.ContainsKey(attrib))
            {
                stream.GoBack(2);
                return (_parsers[DEFAULT_ATTRIBS[attrib]], false);
            }
            stream.GoBack(2);
            return (_parsers["UN"], false);
        }
        
        public Dicom Parse(string filename)
        {
            return new DicomReader(this, filename).Read();
        }
        
        public Dicom Parse(Stream stream)
        {
            return new DicomReader(this, stream).Read();
        }

    }
}