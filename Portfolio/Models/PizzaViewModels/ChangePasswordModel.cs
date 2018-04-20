using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;

namespace Portfolio.Models.PizzaViewModels
{
    public class ChangePasswordModel
	{
		[Required]
		[HiddenInput(DisplayValue = false)]
		public string EncryptionAlgorithm { get; set; }

		[Required]
		[DataType(DataType.Password)]
		[Display(Name = "Current password")]
		public string CurrentPasswordHash { get; set; }

		[Required]
		[DataType(DataType.Password)]
		[Display(Name = "New password")]
		public string NewPasswordHash { get; set; }

		[Required]
		[DataType(DataType.Password)]
		[Display(Name = "Confirm new password")]
		[Compare("NewPasswordHash", ErrorMessage = "The password and confirmation password do not match.")]
		public string ConfirmNewPasswordHash { get; set; }
	}
}
