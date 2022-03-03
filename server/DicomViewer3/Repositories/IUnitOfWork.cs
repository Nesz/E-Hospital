using System.Threading.Tasks;

namespace DicomViewer3.Repositories
{
    public interface IUnitOfWork
    {
        
        IUserRepository Users { get; }
        IStudyRepository Studies { get; }
        ISeriesRepository Series { get; }
        IInstanceRepository Instances { get; }
        IAreaRepository Areas { get; }
        
        Task CompleteAsync();
    }
}