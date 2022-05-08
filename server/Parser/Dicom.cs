namespace Parser;

public class Dicom
{
    public string Preamble { get; }
    public string Prefix { get; }
    public Dictionary<string, DicomItem> Dataset { get; }

    public Dicom(string preamble, string prefix)
    {
        Preamble = preamble;
        Prefix = prefix;
        Dataset = new Dictionary<string, DicomItem>();
    }
        
    public void AddEntry(string tag, DicomItem entry)
    {
        Dataset.Add(tag, entry);
    }
        
    public DicomItem GetEntryByTag(string tag)
    {
        return Dataset[tag];
    }
        
    public bool HasEntryByTag(string tag)
    {
        return Dataset.ContainsKey(tag);
    }
}