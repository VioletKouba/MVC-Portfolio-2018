using System.Data.Common;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Data.Entity.Migrations.History;
using System.Linq;
using Portfolio.Models;

namespace Portfolio.Helpers.MySqlEntityHelper
{
	public class MySqlHistoryContext : HistoryContext
	{
		public MySqlHistoryContext(DbConnection existingConnection, string defaultSchema) : base(existingConnection, defaultSchema)
		{
		}

		protected override void OnModelCreating(DbModelBuilder modelBuilder)
		{
			base.OnModelCreating(modelBuilder);
			modelBuilder.Entity<HistoryRow>().Property(h => h.MigrationId).HasMaxLength(100).IsRequired();
			modelBuilder.Entity<HistoryRow>().Property(h => h.ContextKey).HasMaxLength(200).IsRequired();
		}
	}

	public class MySqlConfiguration : DbConfiguration
	{
		public MySqlConfiguration()
		{
			SetHistoryContext("MySql.Data.MySqlClient", (conn, schema) => new MySqlHistoryContext(conn, schema));
		}
	}

	public class MySqlInitializer : IDatabaseInitializer<PizzaDbContext>
	{
		public void InitializeDatabase(PizzaDbContext context)
		{
			if (!context.Database.Exists())
			{
				context.Database.Create();
			}
			else
			{
				System.Data.Entity.Core.Objects.ObjectResult<int> migrationHistoryTableExists = ((IObjectContextAdapter)context).ObjectContext.ExecuteStoreQuery<int>(
				  "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'portfolio' AND table_name = '__MigrationHistory'");

				if (migrationHistoryTableExists.FirstOrDefault() == 0)
				{
					context.Database.Delete();
					context.Database.Create();
				}
			}
		}
	}
}