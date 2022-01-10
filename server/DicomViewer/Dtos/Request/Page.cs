using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json.Serialization;
using System.Threading.Tasks;
using DicomViewer.Entities;
using DicomViewer.Helpers;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion.Internal;

namespace DicomViewer.Dtos.Request
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