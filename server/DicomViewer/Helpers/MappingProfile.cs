using System;
using AutoMapper;
using DicomViewer.Dtos;
using DicomViewer.Entities;
using Microsoft.OpenApi.Extensions;

namespace DicomViewer.Helpers
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            CreateMap<User, UserDto>()
                .ForMember(dest => dest.Role, opt => opt.MapFrom(src => Enum.GetName(src.Role)));
        }
    }
}