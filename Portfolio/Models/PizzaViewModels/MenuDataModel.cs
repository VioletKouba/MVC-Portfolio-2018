using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Portfolio.Models.PizzaViewModels
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
}
