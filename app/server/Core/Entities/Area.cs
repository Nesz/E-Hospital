using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Core.Entities;

public class Area
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public long Id { get; set; }
    public Series Series { get; set; }
    public string Label { get; set; }
    public char Orientation { get; set; }
    public int Slice { get; set; }
    public virtual IEnumerable<int> Vertices { get; set; }
}