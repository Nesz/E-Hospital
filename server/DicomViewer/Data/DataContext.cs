using DicomViewer.Entities;
using Microsoft.EntityFrameworkCore;

namespace DicomViewer.Data
{
    public class DataContext : DbContext
    {
        public DataContext()
        {
        }

        public DataContext(DbContextOptions options) : base(options)
        {

        }
        
        public DbSet<DicomMeta> DicomMetas { get; set; }
        public DbSet<User> Users { get; set; }
    }
}