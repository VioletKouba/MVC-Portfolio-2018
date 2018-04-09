using System;
using System.Globalization;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using System.Web;
using System.Web.Mvc;
using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.EntityFramework;
using Microsoft.AspNet.Identity.Owin;
using Microsoft.Owin.Security;
using Portfolio.Helpers;
using Portfolio.Models;

namespace Portfolio.Controllers
{
	public class PizzaController : Controller
	{
		private ApplicationSignInManager _signInManager;
		private ApplicationUserManager _userManager;

		public ApplicationSignInManager SignInManager
		{
			get { return _signInManager ?? HttpContext.GetOwinContext().Get<ApplicationSignInManager>(); }
			private set { _signInManager = value; }
		}

		public ApplicationUserManager UserManager
		{
			get { return _userManager ?? HttpContext.GetOwinContext().GetUserManager<ApplicationUserManager>(); }
			private set { _userManager = value; }
		}

		private IAuthenticationManager AuthenticationManager
		{
			get { return HttpContext.GetOwinContext().Authentication; }
		}

		private void AddErrors(IdentityResult result) { foreach (var error in result.Errors) { ModelState.AddModelError("", error); } }

		private MenuDataModel DeserializeMenuData()
		{
			ContentResult fileContent = MenuData();
			string fileText = fileContent.Content;
			MenuDataModel loadedModel = Newtonsoft.Json.JsonConvert.DeserializeObject<MenuDataModel>(fileText);

			return loadedModel;
		}

		public static string SectionName {
			get { return "Finley's Pizzeria"; }
		}

		public ActionResult Home()
		{
			ViewBag.SectionName = SectionName;

			return View(DeserializeMenuData());
		}

		public ActionResult Cart()
		{
			ViewBag.SectionName = SectionName;
			ViewBag.IsMainCart = true;

			return View(DeserializeMenuData());
		}

		public ActionResult Designer()
		{
			ViewBag.SectionName = SectionName;

			return View(DeserializeMenuData());
		}

		public ActionResult Menu()
		{
			ViewBag.SectionName = SectionName;

			return View(DeserializeMenuData());
		}

		public ActionResult ThankYou()
		{
			ViewBag.SectionName = SectionName;

			return View();
		}

		public ActionResult Account()
		{
			ViewBag.SectionName = SectionName;

			if (Request.IsAuthenticated) { return View(new UserHelper(User.Identity.GetUserId()).user); }
			else return RedirectToAction("Login", "Pizza");
		}

		public ActionResult ChangeDetails()
		{
			ViewBag.SectionName = SectionName;

			if (Request.IsAuthenticated)
			{
				PizzaUser UserData = new UserHelper(User.Identity.GetUserId()).user;

				ChangeDetailsModel model = new ChangeDetailsModel
				{
					EmailAddress = UserData.Email,
					ReceivesEmails = UserData.ReceivesEmails,
					FirstName = UserData.FirstName,
					LastName = UserData.LastName,
					PhoneNumber = UserData.PhoneNumber,
					PhoneExtension = UserData.PhoneExtension,
					Country = UserData.Country,
					StreetAddress = UserData.StreetAddress,
					ApartmentNumber = UserData.ApartmentNumber,
					City = UserData.City,
					State = UserData.State,
					ZipCode = UserData.ZipCode
				};
				return View(model);
			}
			else return RedirectToAction("Login", "Pizza");
		}

		[HttpPost]
		[ValidateAntiForgeryToken]
		public async Task<ActionResult> ChangeDetails(ChangeDetailsModel model)
		{
			ViewBag.SectionName = SectionName;

			if (ModelState.IsValid)
			{
				if (UserManager.PasswordHasher.VerifyHashedPassword(
					UserManager.FindById(User.Identity.GetUserId()).PasswordHash,
					model.CurrentPasswordHash
				).ToString() == "Success")
				{
					UserHelper helper = new UserHelper(User.Identity.GetUserId());

					helper.user.Email = model.EmailAddress;
					helper.user.ReceivesEmails = model.ReceivesEmails;
					helper.user.FirstName = model.FirstName;
					helper.user.LastName = model.LastName;
					helper.user.PhoneNumber = model.PhoneNumber;
					helper.user.PhoneExtension = model.PhoneExtension;
					helper.user.Country = model.Country;
					helper.user.StreetAddress = model.StreetAddress;
					helper.user.ApartmentNumber = model.ApartmentNumber;
					helper.user.City = model.City;
					helper.user.State = model.State;
					helper.user.ZipCode = model.ZipCode;

					var firstResult = await helper.manager.UpdateAsync(helper.user);
					if (firstResult.Succeeded)
					{
						bool secondResult = true;
						try { await helper.db.SaveChangesAsync(); }
						catch
						{
							ModelState.AddModelError("", "Sorry, our database failed to update. Please try again in a few minutes.");
							secondResult = false;
						}
						if (secondResult) { return RedirectToAction("Account", "Pizza"); }
					}
					else { AddErrors(firstResult); }
				}
				else { ModelState.AddModelError("", "The password you entered is incorrect."); };
			}
			return View(model);
		}

		public ActionResult ChangePassword()
		{
			ViewBag.SectionName = SectionName;

			if (Request.IsAuthenticated) { return View(); }
			else return RedirectToAction("Login", "Pizza");
		}

		[HttpPost]
		[ValidateAntiForgeryToken]
		public async Task<ActionResult> ChangePassword(ChangePasswordModel model)
		{
			ViewBag.SectionName = SectionName;

			if (ModelState.IsValid)
			{
				var result = await UserManager.ChangePasswordAsync(User.Identity.GetUserId(), model.CurrentPasswordHash, model.NewPasswordHash);
				if (result.Succeeded)
				{
					var user = await UserManager.FindByIdAsync(User.Identity.GetUserId());
					if (user != null) { await SignInManager.SignInAsync(user, isPersistent: false, rememberBrowser: false); }
					return RedirectToAction("Account", "Pizza");
				}
				else { AddErrors(result); }
			}
			return View(model);
		}

		[AllowAnonymous]
		public ActionResult Login()
		{
			ViewBag.SectionName = SectionName;

			return View();
		}

		[HttpPost]
		[AllowAnonymous]
		[ValidateAntiForgeryToken]
		public async Task<ActionResult> Login(LoginModel model)
		{
			ViewBag.SectionName = SectionName;

			if (ModelState.IsValid)
			{
				var result = await SignInManager.PasswordSignInAsync(model.EmailAddress, model.PasswordHash, model.RememberUser, shouldLockout: true);
				switch (result)
				{
					case SignInStatus.Success:
						return RedirectToAction("Account", "Pizza");
					case SignInStatus.LockedOut:
						model.LockedOut = true;
						return View(model);
					default:
						ModelState.AddModelError("", "Invalid login attempt.");
						return View(model);
				}
			}
			else return View(model);
		}

		public ActionResult Logout()
		{
			ViewBag.SectionName = SectionName;

			if (Request.IsAuthenticated) {
				AuthenticationManager.SignOut(DefaultAuthenticationTypes.ApplicationCookie);
				return RedirectToAction("Home", "Pizza");
			}
			else return RedirectToAction("Login", "Pizza");
		}

		[AllowAnonymous]
		public ActionResult Register()
		{
			ViewBag.SectionName = SectionName;

			if (Request.IsAuthenticated) {return RedirectToAction("Account", "Pizza");}
			else {return View();}
		}

		[HttpPost]
		[AllowAnonymous]
		[ValidateAntiForgeryToken]
		public async Task<ActionResult> Register(RegistrationModel model)
		{
			ViewBag.SectionName = SectionName;

			if (ModelState.IsValid)
			{
				var user = new PizzaUser
				{
					UserName = model.EmailAddress,
					Email = model.EmailAddress,
					PhoneNumber = model.PhoneNumber,

					EncryptionAlgorithm = model.EncryptionAlgorithm,
					ReceivesEmails = model.ReceivesEmails,
					FirstName = model.FirstName,
					LastName = model.LastName,
					PhoneExtension = model.PhoneExtension,
					Country = model.Country,
					StreetAddress = model.StreetAddress,
					ApartmentNumber = model.ApartmentNumber,
					City = model.City,
					State = model.State,
					ZipCode = model.ZipCode
				};
				var result = await UserManager.CreateAsync(user, model.PasswordHash);
				if (result.Succeeded)
				{
					await SignInManager.SignInAsync(user, isPersistent: false, rememberBrowser: false);

					model.Registered = true;

					return View(model);
				}
				else AddErrors(result);
			}

			return View(model);
		}

		public ActionResult _CartWidget()
		{
			return PartialView(DeserializeMenuData());
		}

		public ContentResult MenuData()
		{
			string unmappedPath = "~/App_Data/MenuData.json";
			string mappedPath = Server.MapPath(unmappedPath);
			string fileText = System.IO.File.ReadAllText(mappedPath);

			return Content(fileText);
		}
	}
}