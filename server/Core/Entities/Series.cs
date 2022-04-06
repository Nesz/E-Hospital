using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Core.Entities;

public class Series
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public long Id { get; set; }
    public string OriginalId { get; set; }
    public string Description { get; set; }
    public string Modality { get; set; }
    public DateTime Date { get; set; }
    public virtual Study Study { get; set; }
    public virtual List<Instance> Instances { get; set; }
    public virtual List<Area> Areas { get; set; }
}