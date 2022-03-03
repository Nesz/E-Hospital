using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using DicomViewer3.Dtos;
using DicomViewer3.Entities;
using DicomViewer3.Helpers;
using DicomViewer3.Models;
using DicomViewer3.Repositories;
using Microsoft.EntityFrameworkCore;

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

        public async Task AddArea(long seriesId, AreaAddRequestDto request)
        {
            var series = await _unitOfWork.Series.GetById(seriesId);
            var area = new Area
            {
                Series = series,
                Label = request.Label,
                Orientation = request.Orientation,
                Slice = request.Slice,
                Vertices = request.Vertices
            };
            await _unitOfWork.Areas.Add(area);
            await _unitOfWork.CompleteAsync();
        }

        public async Task<IEnumerable<AreaDto>> GetAreas(long seriesId)
        {
            var areas = await _unitOfWork.Areas.GetAreasBySeriesId(seriesId);
            return _mapper.Map<IList<AreaDto>>(areas);
        }
    }
}