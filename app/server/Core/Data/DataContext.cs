using Core.Entities;
using Microsoft.EntityFrameworkCore;

namespace Core.Data;

public class DataContext : DbContext
{
    public DataContext()
    {
    }

    public DataContext(DbContextOptions options) : base(options)
    {

    }

    public DbSet<User> Users { get; set; }
    public DbSet<Study> Studies { get; set; }
    public DbSet<Series> Series { get; set; }
    public DbSet<Instance> Instances { get; set; }
    public DbSet<Area> Areas { get; set; }
        
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        var intValueConverter = new IntListToJsonValueConverter();

        modelBuilder
            .Entity<Area>()
            .Property(e => e.Vertices)
            .HasConversion(intValueConverter);

    }
}