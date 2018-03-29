using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Portfolio.Models
{
	public class CarouselModel
	{
		public bool Automatic { get; set; }
		public short AutomaticDelay { get; set; }
		public bool DelayedResume { get; set; }
		public short ResumeDelay { get; set; }
		public List<CarouselItemModel> Items { get; set; }
	}
	public class CarouselItemModel
	{
		public string URL { get; set; }
		public string Background { get; set; }
		public string Caption { get; set; }
	}
}