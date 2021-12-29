using AutoMapper;
using DicomViewer.Dtos;
using DicomViewer.Entities;

namespace DicomViewer.Helpers
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            CreateMap<User, UserDto>();
        }
    }
}