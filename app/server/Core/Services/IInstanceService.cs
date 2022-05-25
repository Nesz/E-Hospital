using System.IO;
using System.Threading.Tasks;

namespace Core.Services;

public interface IInstanceService
{
    Task<dynamic> GetInstanceMeta(long instanceId);
}