using System.Collections.Generic;

namespace DicomParser
{
    public class Dicom
    {
        public string Preamble { get; }
        public string Prefix { get; }
        public Dictionary<string, DicomItem> Entries { get; }

        public Dicom(string preamble, string prefix)
        {
            Preamble = preamble;
            Prefix = prefix;
            Entries = new Dictionary<string, DicomItem>();
        }
        
        public void AddEntry(string tag, DicomItem entry)
        {
            Entries.Add(tag, entry);
        }
        
        public DicomItem GetEntryByTag(string tag)
        {
            return Entries[tag];
        }
        
        public bool HasEntryByTag(string tag)
        {
            return Entries.ContainsKey(tag);
        }
    }
}