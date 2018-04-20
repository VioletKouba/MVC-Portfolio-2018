using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;

namespace Portfolio.Models.PizzaViewModels
{
    public class RegistrationModel : UserDataModel
	{
		[Required]
		[HiddenInput(DisplayValue = false)]
		public string EncryptionAlgorithm { get; set; }

		[Required]
		[StringLength(100, ErrorMessage = "The {0} must be at least {2} characters long.", MinimumLength = 6)]
		[DataType(DataType.Password)]
		[Display(Name = "Password")]
		public string PasswordHash { get; set; }

		[DataType(DataType.Password)]
		[Display(Name = "Confirm password")]
		[Compare("PasswordHash", ErrorMessage = "The password and confirmation password do not match.")]
		public string ConfirmPasswordHash { get; set; }

		public bool Registered { get; set; }
	}
}
