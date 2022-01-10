using System.ComponentModel.DataAnnotations;
using DicomViewer.Entities;
using DicomViewer.Helpers;

namespace DicomViewer.Dtos.Request
{
    public class PageRequest
    {
        private const int MaxPageSize = 50;

        private int _pageSize;
        
        [Required]
        public int PageSize
        {
            get => _pageSize;
            set => _pageSize = value > MaxPageSize ? MaxPageSize : value;
        }

        [Required]
        public int PageNumber { get; set; }

        public string PageOrder { get; set; } = "Id";
        public OrderDirection OrderDirection { get; set; } = OrderDirection.DESCENDING;
        
        [Lowercase]
        public string FilterKey { get; set; }
    }
}