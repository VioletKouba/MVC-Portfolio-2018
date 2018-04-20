using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Portfolio.Models.SharedViewModels
{
	public class CarouselModel
	{
		public bool Automatic { get; set; }
		public short AutomaticDelay { get; set; }
		public bool DelayedResume { get; set; }
		public short ResumeDelay { get; set; }
		public List<CarouselItemModel> Items { get; set; }
	}
}
