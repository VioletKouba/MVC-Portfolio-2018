using System.Data.Entity;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.EntityFramework;

namespace Portfolio.Models
{
	public class PizzaUser : IdentityUser
	{
		public string EncryptionAlgorithm { get; set; }

		public bool ReceivesEmails { get; set; }

		public string FirstName { get; set; }

		public string LastName { get; set; }

		public string PhoneExtension { get; set; }

		public string Country { get; set; }

		public string StreetAddress { get; set; }

		public string ApartmentNumber { get; set; }

		public string City { get; set; }

		public string State { get; set; }

		public string ZipCode { get; set; }

		public async Task<ClaimsIdentity> GenerateUserIdentityAsync(UserManager<PizzaUser> manager)
		{
			var userIdentity = await manager.CreateIdentityAsync(this, DefaultAuthenticationTypes.ApplicationCookie);
			return userIdentity;
		}
	}

	public class PizzaDbContext : IdentityDbContext<PizzaUser>
	{
		static PizzaDbContext()
		{
			Database.SetInitializer(new Helpers.MySqlEntityHelper.MySqlInitializer());
		}

		public PizzaDbContext() : base("DefaultConnection") { }

		public static PizzaDbContext Create() { return new PizzaDbContext(); }
	}
}