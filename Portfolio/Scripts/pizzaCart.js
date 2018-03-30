$(document).ready(function() {
	var Buffer = require("buffer").Buffer;
	var LZ4 = require("lz4");
	var encoding = "base64";

	var cartExpiryTime = (3 * 24 * 60 * 60 * 1000);
	var maxSafeInteger = 9007199254740991;//Defined here as IE11 does not have the Number.MAX_SAFE_INTEGER constant.

	var lastCartState;
	var cart;
	
	var $sidebarCartControl = $("#sidebarCartControl");
	var $sidebarCart = $sidebarCartControl.find("#sidebarCart");
	var $cartItemListingTemplate = $("#cartItemListingTemplate").detach().attr("id","");
	var $pageCart = $("#pageCart");
	var $bothCarts = $sidebarCart.add($pageCart);
	
	function compressJSON(data) {
		var inputBuffer = new Buffer(JSON.stringify(data));
		var outputBuffer = new Buffer(LZ4.encodeBound(inputBuffer.length));
		
		function testOutput() {
			for(var i = 0; i < outputBuffer.length; i++) {
				if(outputBuffer[i] != 0) return true;
			}
			return false;
		}
		
		var compressedSize = LZ4.encodeBlock(inputBuffer, outputBuffer);
		outputBuffer = outputBuffer.slice(0, compressedSize);
		
		if (testOutput()) return {
			"compressedString" : outputBuffer.toString(encoding),
			"compressedLength" : inputBuffer.length
		};
		else {
			console.log("The compressed buffer is empty. Saving the uncompressed buffer.");
			return {
				"compressedString" : inputBuffer.toString(encoding),
				"compressedLength" : "error"
			}
		}
	}
	
	function decompressJSON(string, dataLength) {
		var data = new Buffer(string, encoding);
		
		if(dataLength == "error") {
			console.log("The data was saved uncompressed.");
			return JSON.parse(data.toString());
		}
		else {
			var decompressedData = new Buffer(Number(dataLength));
			var decompressedSize = LZ4.decodeBlock(data, decompressedData);
			decompressedData = decompressedData.slice(0, decompressedSize);
		
			return JSON.parse(decompressedData.toString());
		}
	}

	function loadCart(storedCartState) {
		function newCart() {
			return {
				"items": [],
				"itemCounter": 0,
				"promoCodes": [],
				"uid": Math.floor(Math.random() * maxSafeInteger).toString(36),
				"expires": Date.now() + cartExpiryTime,
				"active": false
			}
		}

		if(storedCartState) {
			var storedCart = decompressJSON(storedCartState, localStorage.getItem("compressedLength"));

			if(Date.now() > storedCart.expires) {
				localStorage.removeItem("pizzaCart");
				localStorage.removeItem("compressedLength");
				lastCartState = null;
				cart = newCart();
			}
			else {
				lastCartState = storedCartState;
				cart = storedCart;
			}
		}
		else {
			lastCartState = null;
			cart = newCart();
		}
		updateCart();
	}
	
	function saveCart() {
		var storedCartState = localStorage.getItem("pizzaCart");

		if(storedCartState == lastCartState) {
			cart.expires = Date.now() + cartExpiryTime;

			var compressedCart = compressJSON(cart);

			localStorage.setItem("pizzaCart", compressedCart.compressedString);
			localStorage.setItem("compressedLength", compressedCart.compressedLength);
			lastCartState = localStorage.getItem("pizzaCart");
		}
		else {
			notifyUser("cartUpdated");
			loadCart(storedCartState);
		}
	}
	
	function updateQuantity() {
		var $quantityNumber = $(this);
		var itemIndex = Number($quantityNumber.closest(".itemListing").attr("data-index"));
		var newQuantity = Number($quantityNumber.text());
		
		cart.items[itemIndex].quantity = newQuantity;
		saveCart();
		updateCart();
	}
	
	function removeItem() {
		var $itemListing = $(this).closest(".itemListing");
		var itemIndex = Number($itemListing.attr("data-index"));
		
		cart.items.splice(itemIndex, 1);
		saveCart();
		updateCart();
	}
	
	function addPromoCode() {
		var promoCode = $(this).siblings(".promoCode").val();
		
		if (cart.promoCodes.indexOf(promoCode) != -1) notifyUser("duplicatePromoCode");
		if (menuData.promoCodes[promoCode]) {
			cart.promoCodes.push(promoCode);
			saveCart();
			updateCart();
		}
		else notifyUser("invalidPromoCode");
	}
	
	function updateCart() {
		var cartItems = cart.items;
		var cartUpdated = false;
		
		var cartItemsPrice = 0.00;
		var cartItemDiscounts = 0.00;
		var cartPriceMultiplier = 1;
		var cartPromos = cart.promoCodes;
		var promoStates = {};
		
		var $sidebarCartItemList = $sidebarCart.find(".itemList");
		var $sidebarListAnchor = $sidebarCartItemList.parent();
		var $cartItemList = $pageCart.find(".itemList");
		var $cartListAnchor = $cartItemList.prev();
		var cartSidebarScroll = $sidebarCart.scrollTop();
		var cartScroll = $pageCart.scrollTop();
		
		function generatePromoStates(promoCode) {
			var promoState = {
				"satisfactions": [],
				"satisfyingIndexes": []
			}
			
			for (var i = 0; i < menuData.promoCodes[promoCode].conditions.length; i++) promoState.satisfactions.push(false);
			promoStates[promoCode] = promoState;
		}
		
		function checkCartItems(cartItem, itemIndex) {
			function checkPromoQualification(promoCode, promoState) {
				var promoData = menuData.promoCodes[promoCode];
					
				function checkConditions(condition, conditionIndex) {
					var conditionMenuItems;
					if (condition.menu) conditionMenuItems = ((menuData.bigMenus[condition.menu]) ? menuData.bigMenus[condition.menu] : menuData.smallMenus[condition.menu]).items;
						
					var satisfied = (
						(!condition.menu || (conditionMenuItems[cartItem.key]))
						&& (!condition.size || cartItem.choiceKey == condition.size || (cartItem.options && cartItem.options.size == condition.size))
					);
					if (satisfied) {
						promoState.satisfactions[conditionIndex] = true;
						if (!promoData.discount.wholeOrder) {
							promoState.satisfyingIndexes.push(itemIndex);
						}
					}
				}
					
				menuData.promoCodes[promoCode].conditions.forEach(checkConditions);
			}
				
			$.each(promoStates, checkPromoQualification);
		}

		function checkPromoSatisfaction(promoCode, promoState) {
			var promoData = menuData.promoCodes[promoCode];

			if (promoState.satisfactions.indexOf(false) == -1) { if (promoData.discount.wholeOrder) cartPriceMultiplier -= promoData.discount.lowerBy; }
			else {
				var promoIndex = cart.promoCodes.indexOf(promoCode);
				cart.promoCodes.splice(promoIndex, 1);
				delete promoStates[promoCode];
				notifyUser("noQualifyingItems");
				cartUpdated = true;
			}
		}
		
		function populateCart(cartItem, itemIndex) {
			var itemData = menuItemMap[cartItem.key];
			var choiceData = (cartItem.choiceKey) ? itemData.choices[cartItem.choiceKey] : null;
			var optionData = (cartItem.options) ? {} : null;

			var itemPrice;
			var finalPrice;
			var itemPriceMultiplier = 1;
			
			function applyPromoDiscounts(promoCode, promoState) {
				var promoData = menuData.promoCodes[promoCode];

				if ((promoState.satisfactions.indexOf(false) == -1) && !promoData.discount.wholeOrder && (promoState.satisfyingIndexes.indexOf(itemIndex) != -1)) itemPriceMultiplier -= promoData.discount.lowerBy;
			}

			function loadOptionData(categoryKey, optionValue) {
				function loadToppingData(toppingKey) {optionData[categoryKey].push(designerOptionMap[toppingKey]);}

				if (categoryKey.indexOf("Toppings") == -1) optionData[categoryKey] = designerOptionMap[optionValue];
				else {
					optionData[categoryKey] = [];
					optionValue.forEach(loadToppingData);
				}
			}
			
			function appendItemListing(sidebar) {
				var $newItemListing = $cartItemListingTemplate.clone();
				var $itemList = (sidebar) ? $sidebarCartItemList : $cartItemList;
				var $priceDisplays = $newItemListing.find(".priceDisplay");
				
				$newItemListing.attr("data-index",itemIndex).data("itemKey",cartItem.key).appendTo($itemList);
				$newItemListing.find(".itemName").text(itemData.name);
				$newItemListing.find(".quantityNumber").text(cartItem.quantity);
				
				if (choiceData) {
					$newItemListing.find(".designOptions, .editDesign").remove();
					$newItemListing.data("choiceKey", cartItem.choiceKey).find(".choiceName").text(choiceData.name);
				}
				else if (optionData) {
					var $editDesign = $newItemListing.find(".editDesign");
					var baseURL = $editDesign.attr("href");
					var queryString = "?cart=" + cart.uid + "&item=" + cartItem.uid;

					$newItemListing.find(".choiceName").text(optionData.size.name + " " + optionData.crust.name);
					$editDesign.attr("href", baseURL + queryString);

					if (!sidebar) {
						var sauceText = [];
						var cheeseText = [];

						function populateToppingList(side) {
							var toppingText = [];
							var $toppingDisplay = $newItemListing.find("." + side + "SideToppings").find(".toppingsDisplay");
							var toppingOptions = cartItem.options[side + "Toppings"].sort();
							var toppingData = optionData[side + "Toppings"];

							for (var i = 0; i < toppingOptions.length; i++) {
								if (toppingOptions[i] == "italianSausage") toppingText.push("Italian sausage");
								else toppingText.push(toppingData[i].name.toLowerCase());
							}

							$toppingDisplay.text(toppingText.join(", "));
						}
					
						if(cartItem.options.sauceAmount == "noSauce") sauceText.push("No sauce");
						else {
							sauceText.push(optionData.sauceAmount.name.toLowerCase());
							sauceText.push(" ");
							sauceText.push((cartItem.options.sauce == "alfredo" || cartItem.options.sauce == "bbq") ? optionData.sauce.name : optionData.sauce.name.toLowerCase());
							sauceText.push(" sauce");
						}
						if (cartItem.options.cheeseAmount == "noCheese") cheeseText.push("no cheese");
						else {
							cheeseText.push(optionData.cheeseAmount.name.toLowerCase());
							cheeseText.push(" cheese.");
						}
						
						$newItemListing.find(".sauceOptions").text(sauceText.join(""));
						$newItemListing.find(".cheeseOption").text(cheeseText.join(""));
						(cartItem.options.bothToppings.length > 0) ? populateToppingList("both") : $newItemListing.find(".bothSideToppings").remove();
						(cartItem.options.leftToppings.length > 0) ? populateToppingList("left") : $newItemListing.find(".leftSideToppings").remove();
						(cartItem.options.rightToppings.length > 0) ? populateToppingList("right") : $newItemListing.find(".rightSideToppings").remove();
					}
				}
				else $newItemListing.find(".choiceName, .designOptions, .editDesign").remove();

				$priceDisplays.filter(".itemPrice").text(itemPrice.toFixed(2));
				if (finalPrice != itemPrice) $priceDisplays.filter(".itemPrice").addClass("discounted").next(".finalPrice").text(finalPrice.toFixed(2));
			}

			$.each(promoStates, applyPromoDiscounts);
			
			if (choiceData) itemPrice = (choiceData.price * cartItem.quantity);
			else if (optionData) {
				var toppingCount = cartItem.options.bothToppings.length + (cartItem.options.leftToppings.length / 2) + (cartItem.options.rightToppings.length / 2);

				$.each(cartItem.options, loadOptionData);
				
				itemPrice = floorPrice(
					optionData.size.price
					+ optionData.crust.price
					+ optionData.sauceAmount.price
					+ optionData.cheeseAmount.price
					+ (optionData.size.toppingPrice * Math.max(0, (toppingCount - 1)))
				) * cartItem.quantity;
			}
			else itemPrice = itemData.price * cartItem.quantity;
			finalPrice = itemPrice * itemPriceMultiplier;
			cartItemsPrice += itemPrice;
			cartItemDiscounts += (itemPrice - finalPrice);

			if ($sidebarCart.length > 0) appendItemListing(true);
			if ($pageCart.length > 0) appendItemListing(false);
		}

		cart.promoCodes.forEach(generatePromoStates);
		cartItems.forEach(checkCartItems);
		$.each(promoStates, checkPromoSatisfaction);
		
		if (cart.promoCodes.length > 0) $pageCart.find("#appliedPromoCodes").show().find("#promoCodeDisplay").text(cart.promoCodes.sort().join(", "));
		else $pageCart.find("#appliedPromoCodes").hide();
		
		$sidebarCartItemList.add($cartItemList).detach();

		$sidebarCartItemList.add($cartItemList).html("");
		cartItems.forEach(populateCart);

		$sidebarCartItemList.prependTo($sidebarListAnchor);
		$cartItemList.insertAfter($cartListAnchor);

		$sidebarCart.scrollTop(cartSidebarScroll);
		$pageCart.scrollTop(cartScroll);

		$bothCarts.find(".cartSubtotal").text(cartItemsPrice.toFixed(2)).removeClass("discounted");
		if(cartItemDiscounts > 0 || cartPriceMultiplier != 1) $bothCarts.find(".finalSubtotal").text(((cartItemsPrice - cartItemDiscounts) * cartPriceMultiplier).toFixed(2)).prev(".cartSubtotal").addClass("discounted");
		
		$bothCarts.find(".quantityNumber").on("animationend", resetAnimation).on("quantity:change", updateQuantity).siblings(".quantityControl").click(changeQuantity).mousedown(preventDefault);
		$bothCarts.find(".removeItem").click(removeItem);
		
		$sidebarCartControl.find("#cartCounter").text(cartItems.length);
		if(cartItems.length > 0) {
			$sidebarCartControl.removeClass("disabled");
			$pageCart.find(".sectionDescription").removeClass("shown");
		}
		else {
			if(cart.active) {
				cart.active = false;
				cartUpdated = true;
			}

			$sidebarCartControl.removeClass("active").addClass("disabled");
			$pageCart.find(".sectionDescription").addClass("shown");
		}
		$pageCart.find(".sectionDescription").removeClass("hiddenContents");

		if(cartUpdated) saveCart();
	}

	function openSidebar() {
		$(".orderButton.droppedDown").removeClass("droppedDown");
		$("#choicesOverlay").removeClass("active");
		if (!$sidebarCartControl.hasClass("active")) toggleSidebar();
	}

	function scrollToItem(index) {
		var $item = $sidebarCart.find("[data-index=\"" + index + "\"]");

		var cartScroll = $sidebarCart.scrollTop();
		var cartHeight = $sidebarCart.outerHeight()
		var cartPadding = (cartHeight - $sidebarCart.height()) / 2;

		var itemTop = $item.position().top;
		var offsetTop = itemTop + cartScroll;
		var itemHeight = $item.outerHeight();
		var itemBottom = itemTop + itemHeight;
		var offsetBottom = itemBottom + cartScroll;
	
		cartHeight -= cartPadding;
		if(offsetBottom > (cartScroll + cartHeight)) $sidebarCart.scrollTop(offsetBottom - cartHeight);
		else if (offsetTop < cartScroll) $sidebarCart.scrollTop(offsetTop);

		$item.on("animationend", resetAnimation).css("animation-name", "highlight");
	}
	
	function addToCart(item) {
		var cartItems = cart.items;
		var duplicateIndex = -1;
		
		function duplicateItemCheck(cartItem, itemIndex) {
			function duplicateOptionCheck(optionKey) {
				var leftOption = cartItem.options[optionKey];
				var rightOption = item.options[optionKey];

				if(leftOption === rightOption || (Array.isArray(leftOption) && Array.isArray(rightOption) && String(leftOption.sort()) === String(rightOption.sort()))) return true;
				else return false;
			}

			if(cartItem.key === item.key && cartItem.choiceKey === item.choiceKey && (cartItem.options === item.options || Object.keys(cartItem.options).every(duplicateOptionCheck))) {
				duplicateIndex = itemIndex;
				return true;
			}
			else return false;
		}
		
		if(cartItems.some(duplicateItemCheck)) cartItems[duplicateIndex].quantity += item.quantity;
		else {
			item.uid = cart.itemCounter++;
			cartItems.push(item);
		}
		
		saveCart();
		updateCart();
		openSidebar();
		scrollToItem((duplicateIndex != -1) ? duplicateIndex : cartItems.indexOf(item));
	}

	function getCartUid() {
		if(cart && cart.uid) return cart.uid;
		else return null;
	}

	function getItemByUid(uid) {
		if(cart) {
			var cartItems = cart.items;

			for(var i = 0; i < cart.items.length; i++) {
				var cartItem = cartItems[i];

				if(cartItem.uid == uid) return cartItem;
			}
			return null;
		}
		else return null;
	}

	function editItemByUid(editedItem, cartUid, itemUid) {
		if(cart && cart.uid == cartUid) {
			var cartItem = getItemByUid(itemUid);

			if(cartItem) {
				var itemEdited = false;

				if(cartItem.options && editedItem.options) {
					var itemOptions = cartItem.options;

					function editOptions(optionKey, optionValue) {
						if(String(itemOptions[optionKey]) != String(optionValue)) {
							itemOptions[optionKey] = optionValue;
							itemEdited = true;
						}
					}

					$.each(editedItem.options, editOptions);
				}
				if(cartItem.quantity != editedItem.quantity) {
					cartItem.quantity = editedItem.quantity;
					itemEdited = true;
				}
				
				if(itemEdited) {
					saveCart();
					updateCart();
					openSidebar();
					scrollToItem(cart.items.indexOf(cartItem));
				}
				else notifyUser("noChanges");
			}
			else notifyUser("invalidUid");
		}
		else notifyUser("invalidUid");
	}
	
	function toggleSidebar() {
		if (!$sidebarCartControl.hasClass("disabled")) {
			$sidebarCartControl.toggleClass("active");
			cart.active = !cart.active;
			saveCart();
		}
	}

	function enableTransition() {$sidebarCart.removeClass("beforeLoading");}
	
	/*function emptyCart() {
		localStorage.removeItem("pizzaCart");
		localStorage.removeItem("compressedLength");
		cart = {"items": [], "promoCodes": []};
		updateCart();
	}*/
	
	window.addToCart = addToCart;
	window.getCartUid = getCartUid;
	window.getItemByUid = getItemByUid;
	window.editItemByUid = editItemByUid;
	//window.emptyCart = emptyCart;
	
	if($bothCarts.length > 0) {
		loadCart(localStorage.getItem("pizzaCart"));
		$sidebarCartControl.find("#cartLabel, #closeSidebar").click(toggleSidebar);
		if (cart.active && cart.items.length > 0) {
			$sidebarCart.one("transitionend", enableTransition);
			$sidebarCartControl.addClass("active");
		}
		else enableTransition();
		$pageCart.find("#applyPromoCode").click(addPromoCode);
	}
});