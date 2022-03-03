using System;
using System.Collections.Generic;
using System.Linq;
using AutoMapper;
using DicomViewer.Dtos;
using DicomViewer.Entities;

namespace DicomViewer.Helpers
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            CreateMap<User, UserDto>()
                .ForMember(dest => dest.Role, opt => opt.MapFrom(src => Enum.GetName(src.Role)));
            
            CreateMap<IEnumerable<DicomMeta>, IEnumerable<StudyMetadata>>()
                .ConvertUsing(new DicomMetaConverter());
        }
    }

    public class DicomMetaConverter : ITypeConverter<IEnumerable<DicomMeta>, IEnumerable<StudyMetadata>>
    {
        public IEnumerable<StudyMetadata> Convert(
            IEnumerable<DicomMeta> source, 
            IEnumerable<StudyMetadata> destination, 
            ResolutionContext context
        )
        {
            var outed = new List<StudyMetadata>();
            foreach (var dicomMeta in source)
            {
                var group = GetOrCreateGroup(dicomMeta, outed);
                group.InstancesCount++;
            }

            return outed;
        }

        private static StudyMetadata GetOrCreateGroup(DicomMeta meta, List<StudyMetadata> destination)
        {
            var result = destination.FirstOrDefault(x => x.StudyId == meta.StudyId);
            if (result == null)
            {
                result = new StudyMetadata
                {
                    StudyId = meta.StudyId,
                    PatientId = meta.PatientId,
                    Modality = meta.Modality,
                    StudyDate = meta.StudyDate,
                    StudyDescription = meta.StudyDescription,
                };
                destination.Add(result);
            }

            return result;
        }
    }
}