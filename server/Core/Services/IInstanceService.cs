using System.IO;
using System.Threading.Tasks;

namespace Core.Services;

public interface IInstanceService
{
    Task<Stream> GetInstanceStream(long instanceId);
    Task<dynamic> GetInstanceMeta(long instanceId);
}