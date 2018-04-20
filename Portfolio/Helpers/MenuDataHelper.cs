using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Html;
using Portfolio.Models.PizzaViewModels;

namespace Portfolio.Helpers
{
    public class MenuDataHelper
    {
		public static IHostingEnvironment Environment { get; set; }

		public static HtmlString GetAsText()
		{
			string rootPath = Environment.ContentRootPath;
			string relativePath = "Data/MenuData.json";
			string fullPath = Path.Combine(rootPath, relativePath);
			string fileText = File.ReadAllText(fullPath);

			return new HtmlString(fileText);
		}

		public static MenuDataModel GetAsModel()
		{
			string fileText = GetAsText().ToString();
			MenuDataModel loadedModel = Newtonsoft.Json.JsonConvert.DeserializeObject<MenuDataModel>(fileText);

			return loadedModel;
		}
	}
}
