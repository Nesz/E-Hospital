using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace DicomViewer3.Models
{
    public class Page<T>
    {
        public string PageOrder { get; set; }
        public int PageCurrent { get; set; }
        public int PageTotal { get; set; }
        public int PageSize { get; set; }
        [JsonConverter(typeof(JsonStringEnumConverter))]
        public OrderDirection OrderDirection { get; set; }
        public IEnumerable<T> Data { get; set; }
    }
}