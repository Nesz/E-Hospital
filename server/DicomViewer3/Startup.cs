using System;
using System.ComponentModel;
using System.Text;
using AutoMapper;
using AutoMapper.Internal;
using DicomViewer3.Data;
using DicomViewer3.Entities;
using DicomViewer3.Helpers;
using DicomViewer3.Middleware;
using DicomViewer3.Repositories;
using DicomViewer3.Repositories.Impl;
using DicomViewer3.Services;
using DicomViewer3.Services.Impl;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc.Authorization;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;

namespace DicomViewer3
{
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

            services
                .AddHttpContextAccessor()
                .AddSingleton(mapperConfig.CreateMapper())
                //.AddScoped<IUserRepository, UserRepository>()
                //.AddScoped<IStudyRepository, StudyRepository>()
                //.AddScoped<ISeriesRepository, SeriesRepository>()
                //.AddScoped<IInstanceRepository, InstanceRepository>()
                .AddScoped<IUnitOfWork, UnitOfWork>()

                .AddScoped<IInstanceService, InstanceService>()
                .AddScoped<ISeriesService, SeriesService>()
                .AddScoped<IUserService, UserService>()
                .AddScoped<IDicomService, DicomService>()
                .AddScoped<IMongoService, MongoService>()
                .AddScoped<IUserAccessor, UserAccessor>()
                .AddScoped<IPasswordHasher<User>, BCryptPasswordHasher<User>>()
                
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
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env, 
            DataContext dataContext)
        {
            dataContext.Database.Migrate();

            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
                app.UseSwagger();
                app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "DicomViewer v1"));
            }
            
            app.UseCors("MyAllowSpecificOrigins");


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

            app.UseEndpoints(endpoints => { endpoints.MapControllers(); });
        }
    }
}