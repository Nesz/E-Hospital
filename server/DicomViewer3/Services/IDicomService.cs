using System.Collections.Generic;
using System.Threading.Tasks;
using DicomViewer3.Dtos;
using DicomViewer3.Models;
using Microsoft.AspNetCore.Http;

namespace DicomViewer3.Services
{
    public interface IDicomService
    {
        Task SaveFiles(long patientId, IEnumerable<IFormFile> files);
    }
}