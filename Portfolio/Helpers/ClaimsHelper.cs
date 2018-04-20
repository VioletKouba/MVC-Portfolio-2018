using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;
using Portfolio.Models;

namespace Portfolio.Helpers
{
    public class ClaimsHelper : UserClaimsPrincipalFactory<PizzaUser, IdentityRole>
    {
		public ClaimsHelper(UserManager<PizzaUser> userManager, RoleManager<IdentityRole> roleManager, IOptions<IdentityOptions> optionsAccessor) : base(userManager, roleManager, optionsAccessor)
		{
		}

		public async override Task<ClaimsPrincipal> CreateAsync(PizzaUser user)
		{
			ClaimsPrincipal principal = await base.CreateAsync(user);

			((ClaimsIdentity)principal.Identity).AddClaims(new[] {
				new Claim("EncryptionAlgorithm", user.EncryptionAlgorithm),
				new Claim("ReceivesEmails", user.ReceivesEmails.ToString()),
				new Claim(ClaimTypes.GivenName, user.FirstName),
				new Claim(ClaimTypes.Surname, user.LastName),
				new Claim("PhoneExtension", user.PhoneExtension),
				new Claim(ClaimTypes.Country, user.Country),
				new Claim(ClaimTypes.StreetAddress, user.StreetAddress),
				new Claim("ApartmentNumber", user.ApartmentNumber),
				new Claim("City", user.City),
				new Claim(ClaimTypes.StateOrProvince, user.State),
				new Claim(ClaimTypes.PostalCode, user.ZipCode)
			});

			return principal;
		}
    }
}
