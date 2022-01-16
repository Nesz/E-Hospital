using System.Collections.Generic;
using System.Linq;
using AutoMapper;
using DicomViewer3.Dtos;
using DicomViewer3.Entities;
using DicomViewer3.Models;

namespace DicomViewer3.Helpers
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            CreateMap<User, UserDto>();

            CreateMap<Study, StudyDto>();
            CreateMap<Series, SeriesDto>();
            CreateMap<Instance, InstanceDto>();

            CreateMap(typeof(Page<>), typeof(Page<>));
        }
    }
}