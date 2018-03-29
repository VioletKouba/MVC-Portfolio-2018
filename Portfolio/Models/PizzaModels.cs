using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace Portfolio.Models
{
	public class MenuDataModel
	{
		public class MenuData
		{
			public class MenuItemData
			{
				public class OptionsData
				{
					public class OptionData
					{
						public string Name { get; set; }
						public string Image { get; set; }
						public decimal Price { get; set; }
						public string[] AllowedSizes { get; set; }
						public bool Notification { get; set; }
						public decimal ToppingPrice { get; set; }
						public decimal Scale { get; set; }
						public bool Melting { get; set; }
						public string meltedImage { get; set; }
					}

					public Dictionary<string, OptionData> Crusts { get; set; }
					public Dictionary<string, OptionData> Sizes { get; set; }
					public Dictionary<string, OptionData> SauceAmounts { get; set; }
					public Dictionary<string, OptionData> Sauces { get; set; }
					public Dictionary<string, OptionData> CheeseAmounts { get; set; }
					public Dictionary<string, OptionData> CheeseToppings { get; set; }
					public Dictionary<string, OptionData> VegetableToppings { get; set; }
					public Dictionary<string, OptionData> MeatToppings { get; set; }
				}
				public class ChoiceData
				{
					public string Name { get; set; }
					public decimal Price { get; set; }
				}

				public string Name { get; set; }
				public string Description { get; set; }
				public OptionsData Options { get; set; }
				public string ChoiceHeading { get; set; }
				public Dictionary<string, ChoiceData> Choices { get; set; }
				public decimal Price { get; set; }
			}

			public string Name { get; set; }
			public string Description { get; set; }
			public Dictionary<string, MenuItemData> Items { get; set; }
		}

		public class PromoCodeData
		{
			public class DiscountData
			{
				public decimal LowerBy { get; set; }
				public bool WholeOrder { get; set; }
			}

			public Dictionary<string, string>[] Conditions { get; set; }
			public DiscountData Discount { get; set; }
		}

		public Dictionary<string, MenuData> BigMenus { get; set; }
		public Dictionary<string, MenuData> SmallMenus { get; set; }
		public Dictionary<string, PromoCodeData> PromoCodes { get; set; }
	}

	public class NotificationModel
	{
		public string ID { get; set; }
		public string Text { get; set; }
	}

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
		[System.ComponentModel.DataAnnotations.Compare("NewPasswordHash", ErrorMessage = "The password and confirmation password do not match.")]
		public string ConfirmNewPasswordHash { get; set; }
	}

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
		public string Country { get; set; }

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

	public class ChangeDetailsModel : UserDataModel
	{
		[Required]
		[DataType(DataType.Password)]
		[Display(Name = "Current Password")]
		public string CurrentPasswordHash { get; set; }
	}

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
		[System.ComponentModel.DataAnnotations.Compare("PasswordHash", ErrorMessage = "The password and confirmation password do not match.")]
		public string ConfirmPasswordHash { get; set; }

		public bool Registered { get; set; }
	}
}