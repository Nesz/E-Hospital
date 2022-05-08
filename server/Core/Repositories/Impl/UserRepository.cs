using System;
using System.Linq;
using System.Threading.Tasks;
using Core.Data;
using Core.Dtos;
using Core.Entities;
using Core.Helpers;
using Core.Models;
using Microsoft.EntityFrameworkCore;

namespace Core.Repositories.Impl;

public class UserRepository : IUserRepository
{

    private readonly DataContext _context;

    public UserRepository(DataContext context)
    {
        _context = context;
    }

    public async Task<User> GetById(long id)
    {
        return await _context.Users.FirstOrDefaultAsync(user => user.Id == id);
    }

    public async Task<User> GetByEmail(string email)
    {
        return await _context.Users.FirstOrDefaultAsync(user => user.Email == email);
    }

    public async Task<bool> ExistsByEmail(string email)
    {
        return await GetByEmail(email) != null;
    }

    public async Task Add(User user)
    {
        await _context.AddAsync(user);
    }

    public async Task<Page<User>> GetAllPaged(
        int pageNumber,
        int pageSize,
        Func<IQueryable<User>, IQueryable<User>> filter = null,
        Func<IQueryable<User>, IOrderedQueryable<User>> sort = null)
    {
        filter ??= x => x;
        sort ??= x => x.OrderBy(user => user.Id);
            
        var usersFiltered = filter.Invoke(_context.Users);
        var usersCount = await usersFiltered.CountAsync();
        var usersSorted = sort.Invoke(usersFiltered);
        var usersPaged = await usersSorted
            .Skip(pageSize * (pageNumber - 1))
            .Take(pageSize)
            .ToListAsync();
            
        return new Page<User>
        {
            PageTotal = (int) Math.Ceiling(usersCount / (double) pageSize),
            PageCurrent = pageNumber,
            PageSize = pageSize,
            Data = usersPaged
        };
    }

    public async Task<Page<User>> GetAllPaged(UserPageRequestDto request)
    {
        var usersFiltered = _context.Users
            .If(
                () => request.RoleFilter != null,
                e => e.Where(user => user.Role == request.RoleFilter)
            )
            .If(
                () => !string.IsNullOrWhiteSpace(request.KeyFilter),
                e => e.Where(user => 
                    user.Email.ToLower().Contains(request.KeyFilter.ToLower()) ||
                    user.FirstName.ToLower().Contains(request.KeyFilter.ToLower()) ||
                    user.LastName.ToLower().Contains(request.KeyFilter.ToLower())
                )
            );
            
        var usersCount = await usersFiltered.CountAsync();
        var usersPaged = await usersFiltered.IfThenElse(
                () => OrderDirection.Ascending == request.OrderDirection,
                e => e.OrderBy(user => EF.Property<User>(user, request.PageOrder)),
                e => e.OrderByDescending(user => EF.Property<User>(user, request.PageOrder))
            )
            .Skip(request.PageSize * (request.PageNumber - 1))
            .Take(request.PageSize)
            .ToListAsync();

        return new Page<User>
        {
            PageTotal = (int) Math.Ceiling(usersCount / (double) request.PageSize),
            PageCurrent = request.PageNumber,
            PageSize = request.PageSize,
            PageOrder = request.PageOrder,
            OrderDirection = request.OrderDirection,
            Data = usersPaged
        };
    }
}