using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using WMS.API.Middleware;
using WMS.Infrastructure.Data;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Database
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("DefaultConnection")));

// JWT Configuration
var jwtKey = builder.Configuration["Jwt:Key"];
var jwtIssuer = builder.Configuration["Jwt:Issuer"];
var jwtAudience = builder.Configuration["Jwt:Audience"];

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,

        ValidIssuer = jwtIssuer,
        ValidAudience = jwtAudience,

        IssuerSigningKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(jwtKey!))
    };
});

builder.Services.AddAuthorization();
builder.Services.AddHttpContextAccessor();

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngularApp", policy =>
    {
        policy.WithOrigins("http://localhost:4200")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

// Swagger
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Global Exception Middleware
app.UseMiddleware<ExceptionMiddleware>();

//app.UseHttpsRedirection();

// CORS
app.UseCors("AllowAngularApp");

// Authentication & Authorization
app.UseAuthentication();
app.UseAuthorization();

// Seed UserLogins for existing employees without user login records
using (var scope = app.Services.CreateScope())
{
    try
    {
        var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var employeesWithoutLogin = context.Employees
            .Where(e => !context.UserLogins.Any(u => u.Username == e.Email))
            .ToList();
        
        if (employeesWithoutLogin.Any())
        {
            foreach (var emp in employeesWithoutLogin)
            {
                context.UserLogins.Add(new WMS.Domain.Entities.UserLogin
                {
                    Username = emp.Email,
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("Wms@123"),
                    RoleId = emp.RoleId,
                    IsPasswordChanged = false
                });
            }
            context.SaveChanges();
        }

        // Reset unchanged passwords to the default Wms@123 to align existing records
        var unchangedLogins = context.UserLogins.Where(u => !u.IsPasswordChanged).ToList();
        bool updated = false;
        foreach (var login in unchangedLogins)
        {
            bool isDefault = false;
            try
            {
                isDefault = BCrypt.Net.BCrypt.Verify("Wms@123", login.PasswordHash);
            }
            catch
            {
                // Handle invalid hashes
            }

            if (!isDefault)
            {
                login.PasswordHash = BCrypt.Net.BCrypt.HashPassword("Wms@123");
                updated = true;
            }
        }

        if (updated)
        {
            context.SaveChanges();
        }
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Error seeding user logins: {ex.Message}");
    }
}

// Controllers
app.MapControllers();

app.Run();