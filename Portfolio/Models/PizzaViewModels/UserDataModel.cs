using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;

namespace Portfolio.Models.PizzaViewModels
{
    public class UserDataModel
	{
		[Required]
		[EmailAddress]
		[Display(Name = "Email address")]
		public string EmailAddress { get; set; }

		[Display(Name = "Do you want to receive promotional emails from us?")]
		public bool ReceivesEmails { get; set; }

		[Required]
		[StringLength(100)]
		[Display(Name = "First name")]
		public string FirstName { get; set; }

		[Required]
		[StringLength(100)]
		[Display(Name = "Last name")]
		public string LastName { get; set; }

		[Required]
		[DataType(DataType.PhoneNumber)]
		[RegularExpression("^\\(*\\d{3}\\)*(?:\\s|-)*\\d{3}(?:\\s|-)*\\d{4}$", ErrorMessage = "You must enter a valid United States personal phone number.")]
		[Display(Name = "Phone number")]
		public string PhoneNumber { get; set; }

		[RegularExpression("^\\d{1,4}$", ErrorMessage = "You must enter a valid phone extension.")]
		[Display(Name = "Phone extension")]
		public string PhoneExtension { get; set; }

		[Required]
		[HiddenInput(DisplayValue = false)]
		[Display(Name = "Country")]
		public string Country { get { return "United States of America"; } }

		[Required]
		[RegularExpression("^\\d+\\s.+$", ErrorMessage = "You must enter a valid street address.")]
		[Display(Name = "Street address")]
		public string StreetAddress { get; set; }

		[RegularExpression("^\\d{1,4}$", ErrorMessage = "You must enter a valid apartment number.")]
		[Display(Name = "Apartment number")]
		public string ApartmentNumber { get; set; }

		[Required]
		[Display(Name = "City")]
		public string City { get; set; }

		[Required]
		[Display(Name = "State")]
		public string State { get; set; }

		[Required]
		[DataType(DataType.PostalCode)]
		[RegularExpression("^\\d{5}(?:-\\d{4})*$", ErrorMessage = "You must enter a valid United States zip code.")]
		[Display(Name = "Zip code")]
		public string ZipCode { get; set; }
	}
}
