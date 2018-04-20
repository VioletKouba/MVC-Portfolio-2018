using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace Portfolio.Models.PizzaViewModels
{
    public class LoginModel
	{
		[Required]
		[Display(Name = "Email Address")]
		[EmailAddress]
		public string EmailAddress { get; set; }

		[Required]
		[DataType(DataType.Password)]
		[Display(Name = "Password")]
		public string PasswordHash { get; set; }

		[Display(Name = "Remember me?")]
		public bool RememberUser { get; set; }

		public bool LockedOut { get; set; }
	}
}
