namespace Parser;

public class DicomReader
{
    private DicomParser _parser;
    private ByteStream _stream;
    private Dicom _dicom;

    public DicomReader(DicomParser parser, string filename)
    {
        _stream = new ByteStream(File.Open(filename, FileMode.Open));
        _parser = parser;
    }
        
    public DicomReader(DicomParser parser, Stream stream)
    {
        _stream = new ByteStream(stream);
        _parser = parser;
    }
        
    public Dicom Read()
    {
        var preamble = _stream.ReadString(128);
        var prefix   = _stream.ReadString(4);

        _dicom = new Dicom(preamble, prefix);

        while (_stream.Position() < _stream.Length())
        {
            var tag    = _stream.ReadTag();
            var type   = _stream.ReadString(2);
            var parser = _parser.GetParserFor(_stream, tag, type);
            var value  = parser.Item1.Parse(_stream, tag, parser.Item2);
            var entry  = new DicomItem(type, value);
            _dicom.AddEntry(tag, entry);
        }
        
        return _dicom;
    }
}