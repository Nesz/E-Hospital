using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Core.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace Core.Hubs;

[Authorize]
public class ProgressHub : Hub
{

    private readonly IUserAccessor _userAccessor;

    public ProgressHub(IUserAccessor userAccessor)
    {
        _userAccessor = userAccessor;
    }

    public override async Task OnConnectedAsync()
    {
        var id = Context?.User?.Claims?.FirstOrDefault(o => o.Type == ClaimTypes.NameIdentifier)?.Value;
        await AddToGroup(id?.ToString());
        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception exception)
    {
        var id = Context?.User?.Claims?.FirstOrDefault(o => o.Type == ClaimTypes.NameIdentifier)?.Value;
        await RemoveFromGroup(id?.ToString());
        await base.OnDisconnectedAsync(exception);
    }
        
    public string GetConnectionId() => Context.ConnectionId;

    public async Task AddToGroup(string groupName)     
        => await Groups.AddToGroupAsync(Context.ConnectionId, groupName); 
        
    public async Task RemoveFromGroup(string groupName)     
        => await Groups.RemoveFromGroupAsync(Context.ConnectionId, groupName);
        
}