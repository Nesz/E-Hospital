using System.Threading.Tasks;
using DicomViewer3.Dtos;
using DicomViewer3.Models;

namespace DicomViewer.Services
{
    public interface ISeriesService
    {
        Task<Page<SeriesDto>> GetSeriesPaged(long patientId, PageRequest request);
    }
}