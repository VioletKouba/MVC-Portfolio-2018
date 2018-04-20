using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Microsoft.AspNetCore;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Portfolio.Helpers;
using Portfolio.Models;
using Portfolio.Models.PizzaViewModels;

namespace Portfolio.Controllers
{
    public class PizzaController : Controller
	{
		private readonly UserManager<PizzaUser> _userManager;
		private readonly SignInManager<PizzaUser> _signInManager;

		public PizzaController(
			UserManager<PizzaUser> userManager,
			SignInManager<PizzaUser> signInManager)
		{
			_userManager = userManager;
			_signInManager = signInManager;
		}

		private void AddErrors(IdentityResult result) { foreach (IdentityError error in result.Errors) { ModelState.AddModelError("", error.ToString()); } }

		private string NormalizePhoneNumber(string PhoneNumber)
		{
			Regex pattern = new Regex("^\\d$");
			string digits = "";

			foreach (char character in PhoneNumber) { if (pattern.IsMatch(character.ToString())) { digits += character; } }

			string areaCode = digits.Substring(0, 3);
			string firstPart = digits.Substring(3, 3);
			string secondPart = digits.Substring(6, 4);

			return String.Format("({0}) {1}-{2}", areaCode, firstPart, secondPart);
		}

		public IActionResult Home()
		{
			return View();
		}

		public IActionResult Cart()
		{
			return View();
		}

		public IActionResult Designer()
		{
			return View(MenuDataHelper.GetAsModel());
		}

		public IActionResult Menu()
		{
			return View(MenuDataHelper.GetAsModel());
		}

		public IActionResult ThankYou()
		{
			return View();
		}

		public IActionResult Account()
		{
			if (_signInManager.IsSignedIn(User)) { return View(new UserHelper(_userManager.GetUserId(HttpContext.User)).user); }
			else return RedirectToAction("Login", "Pizza");
		}

		public IActionResult ChangeDetails()
		{
			if (_signInManager.IsSignedIn(User))
			{
				PizzaUser UserData = new UserHelper(_userManager.GetUserId(HttpContext.User)).user;

				ChangeDetailsModel model = new ChangeDetailsModel
				{
					EmailAddress = UserData.Email,
					ReceivesEmails = UserData.ReceivesEmails,
					FirstName = UserData.FirstName,
					LastName = UserData.LastName,
					PhoneNumber = UserData.PhoneNumber,
					PhoneExtension = UserData.PhoneExtension,
					/*Country = UserData.Country,*/
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
		public async Task<IActionResult> ChangeDetails(ChangeDetailsModel model)
		{
			if (ModelState.IsValid)
			{
				Task<PizzaUser> userLookup = _userManager.FindByIdAsync(_userManager.GetUserId(HttpContext.User));
				userLookup.Wait();
				if (userLookup.IsCompletedSuccessfully)
				{
					if (_userManager.PasswordHasher.VerifyHashedPassword(
					userLookup.Result,
					userLookup.Result.PasswordHash,
					model.CurrentPasswordHash
					).ToString() == "Success")
					{
						UserHelper helper = new UserHelper(_userManager.GetUserId(HttpContext.User));

						string normalizedEmail = model.EmailAddress.ToLower();

						if (helper.user.NormalizedEmail == normalizedEmail || (await helper.manager.FindByEmailAsync(normalizedEmail)) == null)
						{
							helper.user.Email = normalizedEmail;
							helper.user.NormalizedEmail = normalizedEmail;
							helper.user.UserName = normalizedEmail;
							helper.user.NormalizedUserName = normalizedEmail;

							helper.user.ReceivesEmails = model.ReceivesEmails;
							helper.user.FirstName = model.FirstName;
							helper.user.LastName = model.LastName;
							helper.user.PhoneNumber = NormalizePhoneNumber(model.PhoneNumber);
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
						else { ModelState.AddModelError("", "The email address you entered is already registered to another account."); }
					}
					else { ModelState.AddModelError("", "The password you entered is incorrect."); }
				}
				else { ModelState.AddModelError("", userLookup.Exception.Message); }
			}
			return View(model);
		}

		public IActionResult ChangePassword()
		{
			if (_signInManager.IsSignedIn(User)) { return View(); }
			else return RedirectToAction("Login", "Pizza");
		}

		[HttpPost]
		[ValidateAntiForgeryToken]
		public async Task<IActionResult> ChangePassword(ChangePasswordModel model)
		{
			if (ModelState.IsValid)
			{
				Task<PizzaUser> userLookup = _userManager.FindByIdAsync(_userManager.GetUserId(HttpContext.User));
				userLookup.Wait();
				if (userLookup.IsCompletedSuccessfully)
				{
					var result = await _userManager.ChangePasswordAsync(userLookup.Result, model.CurrentPasswordHash, model.NewPasswordHash);
					if (result.Succeeded)
					{
						var user = await _userManager.FindByIdAsync(_userManager.GetUserId(HttpContext.User));
						if (user != null) { await _signInManager.SignInAsync(user, false); }
						return RedirectToAction("Account", "Pizza");
					}
					else { AddErrors(result); }
				}
				else { ModelState.AddModelError("", userLookup.Exception.Message); }
			}
			return View(model);
		}

		[AllowAnonymous]
		public IActionResult Login()
		{
			return View();
		}

		[HttpPost]
		[AllowAnonymous]
		[ValidateAntiForgeryToken]
		public async Task<IActionResult> Login(LoginModel model)
		{
			if (ModelState.IsValid)
			{
				var result = await _signInManager.PasswordSignInAsync(model.EmailAddress, model.PasswordHash, model.RememberUser, true);
				if (result.Succeeded) {
					return RedirectToAction("Account", "Pizza");
				}
				else if (result.IsLockedOut) {
					model.LockedOut = true;
					return View(model);
				}
				else {
					ModelState.AddModelError("", "Invalid login attempt.");
					return View(model);
				}
			}
			else return View(model);
		}

		public async Task<IActionResult> Logout()
		{
			if (_signInManager.IsSignedIn(User))
			{
				await _signInManager.SignOutAsync();
				return RedirectToAction("Home", "Pizza");
			}
			else return RedirectToAction("Login", "Pizza");
		}

		[AllowAnonymous]
		public IActionResult Register()
		{
			if (_signInManager.IsSignedIn(User)) { return RedirectToAction("Account", "Pizza"); }
			else { return View(); }
		}

		[HttpPost]
		[AllowAnonymous]
		[ValidateAntiForgeryToken]
		public async Task<IActionResult> Register(RegistrationModel model)
		{
			if (ModelState.IsValid)
			{
				var user = new PizzaUser
				{
					UserName = model.EmailAddress.ToLower(),
					Email = model.EmailAddress.ToLower(),
					PhoneNumber = NormalizePhoneNumber(model.PhoneNumber),

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
				IdentityResult result = await _userManager.CreateAsync(user, model.PasswordHash);
				if (result.Succeeded)
				{
					await _signInManager.SignInAsync(user, false);

					model.Registered = true;

					return View(model);
				}
				else AddErrors(result);
			}

			return View(model);
		}
	}
}