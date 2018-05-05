using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Portfolio.Models;

namespace Portfolio.Data
{
	public class PizzaDbContext : IdentityDbContext<PizzaUser>
	{
		protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
		{
			optionsBuilder.UseMySql(/*Authentication data scrubbed from source code.*/"");
		}

		public static PizzaDbContext Create() { return new PizzaDbContext(); }
	}
}
