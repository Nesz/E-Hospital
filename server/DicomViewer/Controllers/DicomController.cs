using System.Collections.Generic;
using System.IO;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading.Tasks;
using DicomViewer.Entities;
using DicomViewer.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace DicomViewer.Controllers
{
    [ApiController]
    [Route("[controller]")]
    [DisableRequestSizeLimit]
    public class DicomController : ControllerBase
    {
        
        private readonly DicomService _dicomService;

        public DicomController(DicomService dicomService)
        {
            _dicomService = dicomService;
        }

        [HttpGet]
        public async Task<IEnumerable<DicomMeta>> GetDicomList()
        {
           return await _dicomService.GetList();
        }

        [HttpGet("{patientId}/{studyId}/{seriesId}/{instanceId:int}/frame")]
        public async Task<Stream> GetFrameInstance(string patientId, string studyId, string seriesId, int instanceId)
        {
            return await _dicomService.GetFrameData(studyId, seriesId, instanceId);
        }

        [HttpGet("{patientId}/{studyId}/{seriesId}/{instanceId:int}/meta")]
        public async Task<dynamic> GetMetadata(string patientId, string studyId, string seriesId, int instanceId)
        {
            return await _dicomService.GetFrameMetadata(studyId, seriesId, instanceId);
        }
        
        [HttpGet("{patientId}/{studyId}/{seriesId}")]
        public async Task<dynamic> GetMetadataa(string patientId, string studyId, string seriesId)
        {
            return await _dicomService.GetSeriesMetadata(studyId, seriesId);
        }

        [HttpPost]
        public async Task UploadDicom([FromForm(Name = "file[]")] IFormFile[] files)
        {
            await _dicomService.SaveFiles(files);
        }
 
 
 /*[HttpPost("1")]

 [HttpPost]
 public Dicom SparseDicom([FromForm(Name ="file")] IFormFile file)
 {
     var parser = DicomParse.GetDefaultParser();

     var files = Request.Form.Files;

     using (var stream = files[0].OpenReadStream())
     {
         var a = parser.Parse(stream);

         var dm = new DicomMetadata()
         {
             entries = BsonDocument.Parse(JsonSerializer.Serialize(a.Entries)),
             preamble = a.Preamble,
             prefix = a.Prefix
         };
         
         dm = _metadataService.Save(dm);

         var dk = new Dikom()
         {
             MongoId = dm.Id,
             PatientId = (string)a.Entries["00100020"].Value,
             SeriesId = (string)a.Entries["0020000E"].Value,
             StudyId = (string)a.Entries["0020000D"].Value,
             InstanceId = Convert.ToInt32((uint)a.Entries["00200013"].Value),
         };
         
         //Console.WriteLine(JsonSerializer.Serialize(dk));
         _dataContext.Dikoms.Add(dk);
         _dataContext.SaveChanges();
         

         /* using (var img = Image.FromStream(stream))
         {
             var path = "C:\\Users\\Filip\\RiderProjects\\ConsoleApp2\\ConsoleApp2\\xd.png";
             img.Save(path, ImageFormat.Png);
         } */
                
                /*System.IO.File.WriteAllBytes(
                    "C:\\Users\\Filip\\RiderProjects\\ConsoleApp2\\ConsoleApp2\\xd.jpg", 
                    a.Entries["7FE00010"].GetAsListBytes()[0]
                );*/

                //return a;
                /*var parsed = parser.Parse(ReadFully(stream));
                return parsed;
                var bytes = Encoding.UTF8.GetBytes(JsonSerializer.Serialize(parsed));
                using (var msi = new MemoryStream(bytes))
                using (var mso = new MemoryStream())
                {
                    using (var gs = new GZipStream(mso, CompressionMode.Compress))
                    {
                        msi.CopyTo(gs);
                    }
                    //Response.Headers.Add("Content-Encoding", "gzip");
                    Response.Body.WriteAsync(mso.ToArray());
                }*/


            //}
        //}
    }
}