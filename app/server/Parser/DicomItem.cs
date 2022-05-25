namespace Parser;

public class DicomItem
{
    public string VR { get; }
    public object Value { get; set; }

    public DicomItem(string valueRepresentation, object value)
    {
        VR = valueRepresentation;
        Value = value;
    }

    public List<byte[]> GetAsListBytes() => (List<byte[]>) Value;
    public DateTime GetAsDateTime() => (DateTime) Value;
    public TimeSpan GetAsTimeSpan() =>  (TimeSpan) Value;
    public string GetAsString() => (string) Value;
    public byte[] GetAsBytes() => (byte[]) Value;
    public uint GetAsUInt() => (uint)Value;
    public int GetAsInt() => (int)Value;
    public ushort GetAsUShort() => (ushort)Value;
    
}