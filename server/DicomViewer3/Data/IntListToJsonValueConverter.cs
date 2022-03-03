using System.Collections.Generic;
using System.Text.Json;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace DicomViewer3.Data
{
    public class IntListToJsonValueConverter : ValueConverter<IEnumerable<int>, string>
    {
        public IntListToJsonValueConverter() : base(le => ListToString(le), s => StringToList(s))
        {

        }

        private static string ListToString(IEnumerable<int> value)
        {
            return JsonSerializer.Serialize(value);
        }

        private static IEnumerable<int> StringToList(string value)
        {
            return JsonSerializer.Deserialize<IEnumerable<int>>(value);
        }
    }
}