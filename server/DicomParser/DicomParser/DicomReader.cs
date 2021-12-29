using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using ConsoleApp2.types;

namespace DicomParser
{
    
    public class DicomReader
    {

        private static Dictionary<Type, List<long>> times = new Dictionary<Type, List<long>>();
        
        private DicomParse _parser;
        private ByteStream _stream;
        private Dicom _dicom;

        public DicomReader(DicomParse parser, string filename)
        {
            _stream = new ByteStream(File.Open(filename, FileMode.Open));
            _parser = parser;
        }
        
        public DicomReader(DicomParse parser, Stream stream)
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

            //foreach (var keyValuePair in times)
            //{
            //    Console.WriteLine($"{keyValuePair.Key.ToString(), -40} avg: {keyValuePair.Value.Average()}ms");
            //}
            
            return _dicom;
        }
    }
}