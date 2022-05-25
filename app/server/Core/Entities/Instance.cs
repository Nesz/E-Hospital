using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Core.Entities;

public class Instance
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public long Id { get; set; }
    public long OriginalId { get; set; }

    [Column(TypeName = "jsonb")]
    public string DicomMeta { get; set; }
    public long FileOffset { get; set; }
    public long ChunkSize { get; set; }
    public virtual Series Series { get; set; }
}