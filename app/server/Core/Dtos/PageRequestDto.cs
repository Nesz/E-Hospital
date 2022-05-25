using System.ComponentModel.DataAnnotations;
using Core.Models;

namespace Core.Dtos;

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