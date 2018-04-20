using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Portfolio.Data;

namespace Portfolio.Helpers
{
    public class MigrationsHelper
    {
		public static void CreateDb(IServiceProvider applicationServices)
		{
			IServiceScope serviceScope = applicationServices.GetRequiredService<IServiceScopeFactory>().CreateScope();
			PizzaDbContext db = serviceScope.ServiceProvider.GetService<PizzaDbContext>();
			db.Database.Migrate();
		}
    }
}
