using System;

namespace Core.Models;

public class Progress
{
    public Guid Id { get; set; }
    public long CurrentProgress { get; set; }
    public long TotalProgress { get; set; }
}