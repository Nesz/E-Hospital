using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;

namespace DicomViewer3.Services
{
    public interface IDicomService
    {
        Task SaveFiles(long patientId, IEnumerable<IFormFile> files, Guid guid);
        Guid RunTaskSaveFiles(long patientId, IEnumerable<IFormFile> files);
    }
}