using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Core.Entities;

public class Measurement
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public long Id { get; set; }
    public Series Series { get; set; }
    public string Label { get; set; }
    public string Plane { get; set; }
    public string Type { get; set; }
    public int Slice { get; set; }
    
    [Column(TypeName = "integer[]")]
    public virtual int[] Vertices { get; set; }
}