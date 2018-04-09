using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.EntityFramework;
using Portfolio.Models;

namespace Portfolio.Helpers
{
	public class UserHelper
	{
		public PizzaDbContext db;
		public UserStore<PizzaUser> store;
		public UserManager<PizzaUser> manager;
		public PizzaUser user;

		public UserHelper(string userId)
		{
			db = new PizzaDbContext();
			store = new UserStore<PizzaUser>(db);
			manager = new UserManager<PizzaUser>(store);
			user = manager.FindById(userId);
		}
	}
}