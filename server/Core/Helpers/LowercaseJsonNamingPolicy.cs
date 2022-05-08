using System.Text.Json;

namespace Core.Helpers;

public class LowercaseJsonNamingPolicy: JsonNamingPolicy
{
    public LowercaseJsonNamingPolicy()
    {
    }

    public override string ConvertName(string name)
    {
        return name.ToLowerInvariant();
    }
}