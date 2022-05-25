using System;
using System.Collections.Generic;

namespace Core.Dtos;

public class StudyDto
{
    public long Id { get; set; }
    public string OriginalId { get; set; }
    public string Description { get; set; }
    public DateTime Date { get; set; }
}

public class InstanceDto
{
    public long Id { get; set; }
    public long OriginalId { get; set; }
}
    
public class SeriesDto
{
    public long Id { get; set; }
    public string OriginalId { get; set; }
    public string Description { get; set; }
    public string Modality { get; set; }
    public DateTime Date { get; set; }
    public StudyDto Study { get; set; }
    public List<InstanceDto> Instances { get; set; }
}