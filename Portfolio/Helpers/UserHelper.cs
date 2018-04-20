using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Portfolio.Data;
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
			manager = new UserManager<PizzaUser>(store, null, null, null, null, null, null, null, null);

			Task<PizzaUser> userLookup = manager.FindByIdAsync(userId);
			userLookup.Wait();
			user = userLookup.Result;
		}
	}
}
