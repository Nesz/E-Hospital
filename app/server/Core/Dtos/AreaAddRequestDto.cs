using System.Collections.Generic;

namespace Core.Dtos;

public class AreaAddRequestDto
{
    public string Label { get; set; }
    public char Orientation { get; set; }
    public int Slice { get; set; }
    public IEnumerable<int> Vertices { get; set; }
}