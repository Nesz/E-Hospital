using System.Threading.Tasks;

namespace Core.Repositories;

public interface IUnitOfWork
{
        
    IUserRepository Users { get; }
    IStudyRepository Studies { get; }
    ISeriesRepository Series { get; }
    IInstanceRepository Instances { get; }
    IMeasurementRepository Measurements { get; }
        
    Task CompleteAsync();
}