using System.ComponentModel.DataAnnotations;
using DicomViewer3.Models;

namespace DicomViewer3.Dtos
{
    public class PageRequestDto
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

        public string PageOrder { get; set; }
        public OrderDirection OrderDirection { get; set; } = OrderDirection.Descending;
        
    }
}