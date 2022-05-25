namespace Parser.TypeParsers;

public class ParserOtherByteString : IDataTypeParser
{
    public override object Parse(ByteStream byteStream, string tag, bool hasType)
    {
        var images = new List<byte[]>();
        if (hasType)
        {
            byteStream.Skip(2); // skip
        }

        var length = hasType ? byteStream.ReadUInt32() : byteStream.ReadUInt32();

        if (DicomConstats.PixelData != tag || DicomConstats.UndefinedLengthUint32 != length)
        {
            images.Add(byteStream.ReadBytes(length));
            return images;
        }

        var innerTag = byteStream.ReadTag();
        if (DicomConstats.SequenceItemStart == innerTag)
        {
            var sizes = GetFramesSizes(byteStream);
            for (var i = 0; i < sizes.Count; ++i)
            {
                var skip1 = byteStream.ReadTag();
                var image = byteStream.ReadBytes(sizes[i]);
                var skip2 = byteStream.ReadTag();
                images.Add(image);
            }
                
            //byteStream.Skip(4);

            return images;

        }

        return null;
    }
        
    private List<uint> GetFramesSizes(ByteStream byteStream)
    {
        byteStream.Skip(4);
        var offset = 0u;
        var offsets = new List<uint>();
        var framesSizes = new List<uint>();
        while ((offset = byteStream.ReadUInt32()) != 3758161918)
            offsets.Add(offset);

        if (offsets.Count == 0)
        {
            framesSizes.Add((uint)byteStream.Length() - (uint)byteStream.Position() - 8);
            return framesSizes;
        }
            
        offsets.Add((uint)byteStream.Length() - (uint)byteStream.Position() - 4);
            
        for (var i = 1; i < offsets.Count; ++i)
            framesSizes.Add(offsets[i] - offsets[i - 1] - 8);
        return framesSizes;
    }
}