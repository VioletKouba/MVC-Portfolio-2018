using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;

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
	}
}
