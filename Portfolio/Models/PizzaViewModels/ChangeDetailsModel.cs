using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace Portfolio.Models.PizzaViewModels
{
    public class ChangeDetailsModel : UserDataModel
	{
		[Required]
		[DataType(DataType.Password)]
		[Display(Name = "Current Password")]
		public string CurrentPasswordHash { get; set; }
	}
}
