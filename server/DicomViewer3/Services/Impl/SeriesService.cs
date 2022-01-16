using System.Threading.Tasks;
using AutoMapper;
using DicomViewer3.Dtos;
using DicomViewer3.Models;
using DicomViewer3.Repositories;

namespace DicomViewer3.Services.Impl
{
    public class SeriesService : ISeriesService
    {

        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public SeriesService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<Page<SeriesDto>> GetSeriesPaged(long patientId, PageRequestDto request)
        {
            var instances = await _unitOfWork.Series.GetInstancesForPatientId(
                patientId,
                request.PageNumber,
                request.PageSize
            );
            
            return _mapper.Map<Page<SeriesDto>>(instances);
        }

        public async Task<SeriesDto> GetSeriesByPatientAndSeriesId(long patientId, long seriesId)
        {
            var series = await _unitOfWork.Series.GetSeriesByPatientAndSeriesId(patientId, seriesId);
            return _mapper.Map<SeriesDto>(series);
        }
    }
}