namespace Parser;

public class ByteStream
{
    private readonly Stream _stream;

    public ByteStream(Stream stream)
    {
        _stream = stream;
    }
    
    public long Length() => _stream.Length;
    public long Position() => _stream.Position;
    
    public void GoBack(long num) => _stream.Position -= num;
    public void Skip(uint length) => _stream.Seek(length, SeekOrigin.Current);
    
    public int ReadInt16() => BitConverter.ToInt16(ReadBytes(2), 0);
    public int ReadInt32() => BitConverter.ToInt32(ReadBytes(4), 0);
    public long ReadInt64() => BitConverter.ToInt64(ReadBytes(8), 0);
    
    public ushort ReadUInt16() => BitConverter.ToUInt16(ReadBytes(2), 0);
    public uint ReadUInt32() => BitConverter.ToUInt32(ReadBytes(4), 0);
    public ulong ReadUInt64() => BitConverter.ToUInt64(ReadBytes(8), 0);
    

    public float ReadFloat32() => BitConverter.ToSingle(ReadBytes(4));
    public float ReadFloat64() => BitConverter.ToSingle(ReadBytes(8));
    
    public string ReadTag() => ReadHexString(2) + ReadHexString(2);
    
    public byte[] ReadBytes(uint length)
    {
        if (_stream.Position + length > _stream.Length)
            throw new ArgumentException($"index {_stream.Position + length} exceeds array length {_stream.Length}");

        var read = new byte[length];
        _stream.Read(read, 0, (int)length);
        return read;
    }

    public string ReadString(uint length)
    {
        var bytes = ReadBytes(length)
            .TakeWhile(x => x != 0x00)
            .ToArray(); // terminate after null
        return System.Text.Encoding.Default.GetString(bytes);
    }

    public string ReadHexString(uint length)
    {
        var data = ReadBytes(length);
        (data[0], data[1]) = (data[1], data[0]);
        return string.Concat(data.Select(b => b.ToString("X2")));
    }


    
}