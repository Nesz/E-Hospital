using System;
using System.Collections.Generic;
using System.IO;

namespace DicomParser
{
    public class DicomItem
    {
        public string VR { get; }
        public object Value { get; set; }

        public DicomItem(string valueRepresentation, object value)
        {
            VR = valueRepresentation;
            Value = value;
        }

        public List<byte[]> GetAsListBytes() 
        {
            return (List<byte[]>) Value;
        }

        public DateTime GetAsDateTime()
        {
            return (DateTime) Value;
        }
        
        public TimeSpan GetAsTimeSpan()
        {
            return (TimeSpan) Value;
        }
            
        public string GetAsString()
        {
            return (string) Value;
        }
        
        public byte[] GetAsBytes() 
        {
            return (byte[]) Value;
        }
        
        public uint GetAsUInt()
        {
            return (uint)Value;
        }

        public ushort GetAsUShort()
        {
            return (ushort)Value;
        }
    }
}