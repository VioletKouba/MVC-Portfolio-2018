using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace Portfolio.Controllers
{
	public class PortfolioController : Controller
	{
		public static string SectionName
		{
			get { return "Portfolio"; }
		}

		public ActionResult Index()
		{
			ViewBag.SectionName = SectionName;

			return View();
		}
	}
}