using AutoMapper;
using Core.Dtos;
using Core.Entities;
using Core.Models;

namespace Core.Helpers;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        CreateMap<User, UserDto>();

        CreateMap<Study, StudyDto>();
        CreateMap<Series, SeriesDto>();
        CreateMap<Instance, InstanceDto>();
        CreateMap<Measurement, MeasurementDto>();

        CreateMap(typeof(Page<>), typeof(Page<>));
    }
}