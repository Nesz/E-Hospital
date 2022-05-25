using System.Text;
using System.Threading.Tasks;
using AutoMapper;
using Core.Data;
using Core.Entities;
using Core.Helpers;
using Core.Hubs;
using Core.Middleware;
using Core.Repositories;
using Core.Repositories.Impl;
using Core.Services;
using Core.Services.Impl;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc.Authorization;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;

namespace Core;

public class Startup
{
        
    public static readonly ILoggerFactory factory
        = LoggerFactory.Create(builder => { builder.AddConsole(); });
        
    public Startup(IConfiguration configuration)
    {
        Configuration = configuration;
    }

    public IConfiguration Configuration { get; }
        
    // This method gets called by the runtime. Use this method to add services to the container.
    // For more information on how to configure your application, visit https://go.microsoft.com/fwlink/?LinkID=398940
    public void ConfigureServices(IServiceCollection services)
    {

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(Configuration["Secret"]));
        var mapperConfig = new MapperConfiguration(mc => mc.AddProfile(new MappingProfile()));

        services.AddSignalR();
            
        services
            .AddHttpContextAccessor()
            .AddSingleton(mapperConfig.CreateMapper())
            .AddScoped<IUnitOfWork, UnitOfWork>()
            .AddScoped<IInstanceService, InstanceService>()
            .AddScoped<ISeriesService, SeriesService>()
            .AddScoped<IUserService, UserService>()
            .AddScoped<IDicomService, DicomService>()
            .AddScoped<DicomStorageService >()
            .AddScoped<IUserAccessor, UserAccessor>()
            .AddScoped<IPasswordHasher<User>, BCryptPasswordHasher<User>>()

            .Configure<FormOptions>(x => {
                x.ValueLengthLimit = int.MaxValue;
                x.MultipartBodyLengthLimit = int.MaxValue; // In case of multipart
            })
            
            .AddDbContext<DataContext>(opt =>
            {
                //opt.UseLoggerFactory(factory);
                opt.UseNpgsql(Configuration.GetConnectionString("DBConnection"));
            })
                
            .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(opt =>
            {
                opt.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = key,
                    ValidateAudience = false,
                    ValidateIssuer = false,
                    ValidateLifetime = true
                };
                opt.Events = new JwtBearerEvents
                {
                    OnMessageReceived = context =>
                    {
                        var accessToken = context.Request.Query["access_token"];
                            
                        if (!string.IsNullOrEmpty(accessToken))
                        {
                            context.Token = accessToken;
                        }
                        return Task.CompletedTask;
                    }
                };
            });

        services.AddControllers(opt =>
        {
            var policy = new AuthorizationPolicyBuilder().RequireAuthenticatedUser().Build();
            opt.Filters.Add(new AuthorizeFilter(policy));
        });
            
        services.AddSwaggerGen(c =>
        {
            c.SwaggerDoc("v1", new OpenApiInfo { Title = "DicomViewer", Version = "v1" });
        });
            
        services.AddCors(options =>
        {
            options.AddPolicy("MyAllowSpecificOrigins",
                builder =>
                {
                    builder.WithOrigins("*")
                        .AllowAnyHeader()
                        .AllowAnyMethod();
                });
        });
    }

    // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
    public void Configure(IApplicationBuilder app, IWebHostEnvironment env, DataContext dataContext)
    {
        dataContext.Database.Migrate();

        if (env.IsDevelopment())
        {
            app.UseDeveloperExceptionPage();
            app.UseSwagger();
            app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "DicomViewer v1"));
        }
            
        //app.UseCors("MyAllowSpecificOrigins");


        app.UseMiddleware<ErrorHandlingMiddleware>();
        app.UseHttpsRedirection();

        app.UseRouting();
        app.UseCors(x => x
            .AllowAnyMethod()
            .AllowAnyHeader()
            .SetIsOriginAllowed(origin => true) // allow any origin
            .AllowCredentials()); // allow credentials

        app.UseAuthentication();
        app.UseAuthorization();

        app.UseEndpoints(endpoints =>
        {
            endpoints.MapControllers();
            endpoints.MapHub<ProgressHub>("/progresshub");
        });
    }
}