using System.Threading.Tasks;
using DicomViewer3.Data;

namespace DicomViewer3.Repositories.Impl
{
    public class UnitOfWork : IUnitOfWork
    {
        private readonly DataContext _context;
        public IUserRepository Users { get; }
        public IStudyRepository Studies { get; }
        public ISeriesRepository Series { get; }
        public IInstanceRepository Instances { get; set; }
        public IAreaRepository Areas { get; set; }

        public UnitOfWork(DataContext context)
        {
            _context = context;
            Users = new UserRepository(context);
            Studies = new StudyRepository(context);
            Series = new SeriesRepository(context);
            Instances = new InstanceRepository(context);
            Areas = new AreaRepository(context);
        }

        public async Task CompleteAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}