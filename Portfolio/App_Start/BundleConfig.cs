using System.Web;
using System.Web.Optimization;

namespace Portfolio
{
	public class BundleConfig
	{
		public static void RegisterBundles(BundleCollection bundles)
		{
			bundles.Add(new StyleBundle("~/Content/portfolio").Include(
				"~/Content/font-awesome.min.css",
				"~/Content/base-min.css",
				"~/Content/grids-min.css",
				"~/Content/grids-responsive-min.css",
				"~/Content/detab.css",
				"~/Content/portfolio.css"
			));

			bundles.Add(new ScriptBundle("~/Scripts/portfolio").Include(
				"~/Scripts/jquery-3.3.1.min.js",
				"~/Scripts/navDrawer.js"
			));
		}
	}
}
