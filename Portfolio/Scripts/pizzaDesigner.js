$(document).ready(function() {
	var designerData = menuData.bigMenus.pizzas.items.designYourOwn.options;
	var $pizzaDesigner = $("#pizzaDesigner");
	
	var visualizer = $pizzaDesigner.find("#pizzaVisualizer")[0];
	var visualizerContext = visualizer.getContext("2d");
	var visualizing = false;
	var updatedWhileVisualizing = false;
	
	var toppingArea = {
		"height": 161,
		"left":51,
		"top":163,
		"width":405,
		"xCenter":253,
		"xRadius":202,
		"yCenter":243,
		"yRadius":80
	}

	var editing;
	var cartUid;
	var itemUid;

	var designedPizza = {
		"crust": null,
		"size": null,
		"sauceAmount": "normalSauce",
		"sauce": "marinara",
		"cheeseAmount": "normalCheese",
		"bothToppings": [],
		"leftToppings": [],
		"rightToppings": []
	}
	var sideRedirect = ".bothSides";
	
	var imageCount = 0;
	var imagesLoaded = 0;
	var imageError = false;
	
	var leftToppingStates = {};
	var rightToppingStates = {};
	
	var warnedAtFiveToppings = false;
	var warnedAboutGlutenFree = false;
	
	var leftToppingCount = 0;
	var rightToppingCount = 0;

	function loadOptions() {
		if(location.search) {
			var cartUidMatch = location.search.match(/(?:cart=)\w+/)[0];
			var itemUidMatch = location.search.match(/(?:item=)\w+/)[0];

			if(cartUidMatch && itemUidMatch) {
				cartUid = cartUidMatch.split("=")[1];
				itemUid = Number(itemUidMatch.split("=")[1]);

				if(cartUid == getCartUid()) {
					var cartItem = getItemByUid(itemUid);
					var itemOptions = cartItem.options;
					var itemQuantity = cartItem.quantity;

					if(itemOptions) {
						var $orderButton = $pizzaDesigner.find(".orderButton");

						function triggerOptions(optionKey, optionValue) {
							if(optionKey.indexOf("Toppings") == -1) $("#" + optionValue).click();
							else {
								var sideSuffix = (optionKey == "bothToppings") ? "Sides" : "Side";
								var sideClass = optionKey.replace("Toppings", sideSuffix);

								function triggerSelectors(toppingKey) {
									$("#" + toppingKey).find("." + sideClass).click();
								}

								optionValue.forEach(triggerSelectors);
							}
						}

						if(itemOptions.crust == "glutenFree") warnedAboutGlutenFree = true;
						if(
							((itemOptions.bothToppings.length + itemOptions.leftToppings.length) > 4)
							|| ((itemOptions.bothToppings.length + itemOptions.rightToppings.length) > 4)
						) warnedAtFiveToppings = true;

						$.each(itemOptions, triggerOptions);
						$orderButton.find(".buttonLabel").text("Edit");
						$orderButton.find(".quantityNumber").text(cartItem.quantity);
						$orderButton.find(".addToCartButton").text("Confirm Change");

						return true;
					}
					else notifyUser("invalidUid");
				}
				else notifyUser("invalidUid");
			}
		}
		return false;
	}
	
	function visualizePizza() {
		visualizerContext.setTransform(1, 0, 0, 1, 0, 0);
		visualizerContext.clearRect(0, 0, visualizer.width, visualizer.height);
		
		if(!imageError && imagesLoaded < imageCount) setTimeout(visualizePizza, 100);
		else if(!imageError) {
			visualizing = true;

			var ongoingAnimations = false;
			
			var scale = (designedPizza.size) ? designerData.sizes[designedPizza.size].scale : designerData.sizes.twelveInchMedium.scale;
			var xDifference = Math.floor((visualizer.width - (visualizer.width * scale)) / 2);
			var yDifference = Math.floor((visualizer.height - (visualizer.height * scale)) / 2);
			
			var crustImage = (designedPizza.crust && designerData.crusts[designedPizza.crust].image) ? designerData.crusts[designedPizza.crust].image : designerData.crusts.handTossed.image;
			
			var leftStateKeys = Object.keys(leftToppingStates);
			var rightStateKeys = Object.keys(rightToppingStates);
			var currentStates;
			
			function sortKeys(left, right) {
				//Animating toppings last, melting toppings first, anything else between the two.
				if(
					(currentStates[left].animating && !currentStates[right].animating)
					|| (!designerOptionMap[left].melting && designerOptionMap[right].melting)
				) return 1;
				else if(
					(designerOptionMap[left].melting && !designerOptionMap[right].melting)
					|| (!currentStates[left].animating && currentStates[right].animating)
				) return -1;
				else return 0;
			}
			
			function visualizeTopping(key) {
				var state = currentStates[key];
				var toppingData = designerOptionMap[key];

				var staticPieces = 0;
				var erasedPieces = 0;
				
				function visualizePiece(piece, index) {
					if(piece.opacity <= 0) {
						if(state.erasing) erasedPieces++;
						else if(state.animating && !toppingData.melting) {
							piece.opacity = Number((piece.opacity + 0.05).toFixed(2));
							ongoingAnimations = true;
						}
					}
					else if(piece.delay > 0) {
						piece.delay--;
						ongoingAnimations = true;
					}
					else {
						visualizerContext.save();
						
						var toppingImage = toppingData.image;
						
						var xCoord = piece.left;
						var yCoord = piece.top - piece.animationOffset;
						var xCenter = xCoord + (toppingImage.width / 2);
						var yCenter = yCoord + (toppingImage.height / 2);
						
						visualizerContext.translate(xCenter, yCenter);
						visualizerContext.rotate(piece.rotation);
						visualizerContext.translate(xCenter * -1, yCenter * -1);
						
						if(piece.flipped) {
							visualizerContext.scale(-1, 1);
							xCoord = (piece.left + toppingImage.width) * -1;
						}
						
						visualizerContext.globalAlpha = piece.opacity;
						
						visualizerContext.drawImage(toppingImage, 0, 0, toppingImage.width, toppingImage.height, xCoord, yCoord, toppingImage.width, toppingImage.height);
						
						visualizerContext.restore();
						
						if(state.animating && piece.animationOffset > 0) {
							state.pieces[index].animationOffset -= (piece.animationOffset >= 10) ? 10 : piece.animationOffset;
							ongoingAnimations = true;
						}
						else staticPieces++;
						if(state.erasing || (toppingData.melting && !state.animating)) {
							piece.opacity = Number((piece.opacity - 0.1).toFixed(2));
							ongoingAnimations = true;
						}
						else if(piece.opacity < 1) {
							piece.opacity = Number((piece.opacity + 0.05).toFixed(2));
							ongoingAnimations = true;
						}
					}
				}
				
				if(toppingData.melting && !state.animating) {
					var meltedWidth = Math.floor(visualizer.width / 2);
					var meltedX = (currentStates == leftToppingStates) ? 0 : meltedWidth;
					
					if(state.opacity > 0) {
						visualizerContext.globalAlpha = state.opacity;
						visualizerContext.drawImage(toppingData.meltedImage, meltedX, 0, meltedWidth, visualizer.height, meltedX, 0, meltedWidth, visualizer.height);
					}
					
					if(state.erasing) {
						state.opacity = Number((state.opacity - 0.1).toFixed(2));
						ongoingAnimations = true;
					}
					else if(state.opacity < 1) {
						state.opacity = Number((state.opacity + 0.05).toFixed(2));
						ongoingAnimations = true;
					}
				}
				
				state.pieces.forEach(visualizePiece);
				
				if(state.animating) {
					if(staticPieces == state.pieces.length) {
						state.animating = false;
						if(toppingData.melting) ongoingAnimations = true;
					}
				}
				
				if(state.erasing && (state.animating || !toppingData.melting || state.opacity <= 0) && erasedPieces == state.pieces.length) delete currentStates[key];
			}
			
			visualizerContext.globalAlpha = (designedPizza.crust && designedPizza.size) ? 1 : 0.5;
			
			visualizerContext.translate(xDifference, yDifference);
			visualizerContext.scale(scale, scale);
			
			visualizerContext.drawImage(crustImage, 0, 0, visualizer.width, visualizer.height, 0, 0, visualizer.width, visualizer.height);
			
			currentStates = leftToppingStates;
			leftStateKeys.sort(sortKeys);
			leftStateKeys.forEach(visualizeTopping);
			
			currentStates = rightToppingStates;
			rightStateKeys.sort(sortKeys);
			rightStateKeys.forEach(visualizeTopping);
			
			if(ongoingAnimations || updatedWhileVisualizing) {
				if(updatedWhileVisualizing) updatedWhileVisualizing = false;
				requestAnimationFrame(visualizePizza);
			}
			else visualizing = false;
		}
	}
	
	function updatePizza(event) {
		var $option = $(event.target);
		
		if(!$option.hasClass("disabled")) {
			var selected = $option.hasClass("selected");
			
			function deriveSide(classList) {
				if(classList.indexOf("leftSide") != -1) return "left";
				else if(classList.indexOf("rightSide") != -1) return "right";
				else return "both";
			}
				
			function newPieces(toppingData, side) {
				var pieces = [];
				
				//Using a curve of best fit, based on existing topping image sizes and a range from 1 to 13, to determine the maximum number of random pieces to generate.
				var pieceWidth = (toppingData.image.width) ? toppingData.image.width : 0;
				var pieceHeight = (toppingData.image.height) ? toppingData.image.height : 0;
				var pieceArea = pieceWidth * pieceHeight;
				var randomRange = Math.round(1220.386 * Math.pow(pieceArea, -0.7237871));
				var pieceCount = Math.ceil(Math.random() * randomRange) + 7;
				
				var currentCoords = [];
				var sideToppingStates = (side == "left") ? leftToppingStates : rightToppingStates;
				var sideToppingKeys = Object.keys(sideToppingStates);
				var pushedStates = 0;
				
				function newCoords() {
					var coords = [];
					var xOffset = (side == "left") ? 0 : Math.ceil(toppingArea.width / 2);
					var loopCount = 0;
					var severeOverlapCount = 0;
					var leastOverlap;
					var bestCoords;
					var testAgainst = currentCoords;
					
					function isWithinBounds(coords) {
						function testCorner(cornerX, cornerY) {
							return (((Math.pow(cornerX - toppingArea.xCenter, 2) / Math.pow(toppingArea.xRadius, 2)) + (Math.pow(cornerY - toppingArea.yCenter, 2) / Math.pow(toppingArea.yRadius, 2))) <= 1);
						}
						
						var topLeft = testCorner(coords.left, coords.top);
						if(topLeft) var topRight = testCorner(coords.right, coords.top);
						if(topRight) var bottomLeft = testCorner(coords.left, coords.bottom);
						if(bottomLeft) return testCorner(coords.right, coords.bottom);
						return false;
					}
					
					function testOverlap(coords) {
						var overlap = 0;
						var severeOverlap = false;
						
						testAgainst.forEach(function(existingSet) {
							if(!severeOverlap) {
								var xOverlap = Math.max(0, Math.min(coords.right, existingSet.right) - Math.max(coords.left, existingSet.left));
								var yOverlap = Math.max(0, Math.min(coords.bottom, existingSet.bottom) - Math.max(coords.top, existingSet.top));
								overlap += (xOverlap + yOverlap);
								
								if((xOverlap * yOverlap) >= (pieceArea * 0.5)) {
									severeOverlap = true;
									severeOverlapCount++;
								}
							}
						});
						
						//Past the first set, disregard test results that overlap any piece by more than 50%.
						if(!leastOverlap || !severeOverlap && overlap < leastOverlap) {
							leastOverlap = overlap;
							bestCoords = coords;
						}
					}
					
					while(coords.length < ((toppingData.melting) ? 1 : 10) && (!leastOverlap || leastOverlap > 0)) {
						var testCoords = {
							"left":toppingArea.left + xOffset + (Math.round(Math.random() * (Math.floor(toppingArea.width / 2) - pieceWidth))),
							"top":toppingArea.top + (Math.round(Math.random() * (toppingArea.height - pieceHeight)))
						};
						testCoords.right = testCoords.left + pieceWidth;
						testCoords.bottom = testCoords.top + pieceHeight;
						
						if(isWithinBounds(testCoords)) coords.push(testCoords);
						
						loopCount++;
						if(loopCount >= 100) {
							console.log(coords, leastOverlap, bestCoords);
							notifyUser("tooManyLoops");
							throw("Too many loops");
						}
					}
					
					coords.forEach(testOverlap);
					if(severeOverlapCount == coords.length) {
						testAgainst = pieces;
						leastOverlap = null;
						coords.forEach(testOverlap);
					}
					
					return bestCoords;
				}
				
				for(var i = 1; i <= sideToppingKeys.length; i++) {
					var currentState = sideToppingStates[sideToppingKeys[sideToppingKeys.length - i]];
					
					if(!toppingData.melting) {
						function pushCoords(piece) {
							currentCoords.push({
								"left":piece.left,
								"top":piece.top,
								"right":piece.right,
								"bottom":piece.bottom
							});
						}
						
						currentState.pieces.forEach(pushCoords);
						
						pushedStates++;
						//Only considering up to two recent non-melting states.
						if(pushedStates == 2) break;
					}
				}
				
				for(var i = 0; i < pieceCount; i++) {
					var testedCoords = newCoords();
					
					pieces.push(testedCoords);
					currentCoords.push(testedCoords);
					
					var piece = pieces[i];
					piece.animationOffset = piece.top;
					piece.delay = Math.round(Math.random() * 15);
					piece.flipped = Boolean(Math.round(Math.random()));
					piece.opacity = 0.05;
					piece.rotation = Math.round(Math.random() * 22.5 * (Math.round(Math.random()) ? 1 : -1)) * Math.PI / 180;
				}
				
				return pieces;
			}
			
			function newToppingState(toppingData, side) {
				var state = {};
				
				state.animating = true;
				state.erasing = false;
				state.opacity = 0.05;
				state.pieces = newPieces(toppingData, side);
				
				return state;
			}
			
			if($option.hasClass("pizzaOption") && !$option.hasClass("selected")) {
				var optionClasses = $option.attr("class").match(/\w+(?:Option)/g);
				var typeClass = optionClasses[optionClasses.length - 1];
				var optionId = $option.attr("id");
				
				function setOption(type, newValue) {
					var $typeOptions = $pizzaDesigner.find("." + type + "Option");

					designedPizza[type] = newValue;
					$typeOptions.removeClass("selected");
					
					if(newValue != null) $typeOptions.filter("#" + newValue).addClass("selected");
				}
				
				switch(typeClass) {
					case "crustOption":
						var allowedSizes = designerOptionMap[optionId].allowedSizes;
							
						function validateSizeOption() {
							var $this = $(this);
							if(allowedSizes.indexOf($this.attr("id")) == -1) $this.addClass("disabled");
							else $this.removeClass("disabled");
						}
							
						setOption("crust", optionId);
						if(designedPizza.size && allowedSizes.indexOf(designedPizza.size) == -1) {
							setOption("size", null);
							$pizzaDesigner.find(".nextControl").addClass("disabled");
						}
							
						$pizzaDesigner.find(".sizeOption").each(validateSizeOption);

						if (optionId == "glutenFree" && !warnedAboutGlutenFree) {
							notifyUser("glutenFreeDisclaimer");
							warnedAboutGlutenFree = true;
						}
						break;
					case "sizeOption":
						setOption("size", optionId);
						$pizzaDesigner.find(".nextControl.disabled").removeClass("disabled");
						break;
					case "sauceAmountOption":
						var $sauceOptions = $pizzaDesigner.find(".sauceOption");

						setOption("sauceAmount", optionId);
							
						if (optionId == "noSauce") {
							designedPizza.sauce = null;
							$sauceOptions.removeClass("selected").addClass("disabled");
						}
						else {
							$sauceOptions.removeClass("disabled");
							if(!designedPizza.sauce) setOption("sauce", "marinara");
						}
						break;
					case "cheeseAmountOption":
						setOption("cheeseAmount", optionId);
						break;
					case "sauceOption":
						setOption("sauce", optionId);
						break;
					default:
						console.log(typeClass + " is not a valid option type.");
						notifyUser("invalidOption");
				}
			}
			else if ($option.hasClass("toppingSelector")) {
				var $toppingSides = $option.siblings(".sideSelection").children(".sideSelector");
				var $parentOption = $option.parent(".toppingOption");
				var optionId = $parentOption.attr("id");

				if (selected) {
					var $selectedSide = $toppingSides.filter(".selected");

					if ($selectedSide.length > 0) {
						var side = deriveSide($selectedSide.attr("class"));
						var sideToppings = side + "Toppings";
						var toppingIndex = designedPizza[sideToppings].indexOf(optionId);

						designedPizza[sideToppings].splice(toppingIndex, 1);
						if (side == "left" || side == "both") leftToppingStates[optionId].erasing = true;
						if (side == "right" || side == "both") rightToppingStates[optionId].erasing = true;

						$selectedSide.removeClass("selected");
					}

					$option.removeClass("selected");
				}
				else {
					if (leftToppingCount < 10 || rightToppingCount < 10) {
						$option.addClass("selected");
						$option.siblings(".sideSelection").find(sideRedirect).click();
						if (sideRedirect != ".bothSides") sideRedirect = ".bothSides";
					}
					else notifyUser("tenToppings");
				}
			}
			else if($option.hasClass("sideSelector")) {
				var side = deriveSide($option.attr("class"));
				var sideToppings = side + "Toppings";
				var $parentOption = $option.closest(".toppingOption");
				var $toppingSelector = $parentOption.find(".toppingSelector");
				var optionId = $parentOption.attr("id");
				
				if(!$toppingSelector.hasClass("selected")) {
					var sideClass = $option.attr("class").match(/(?:left|right|both)(?:Side)s*/)[0];

					sideRedirect = "." + sideClass;
					$toppingSelector.click();
				}
				else if ($option.hasClass("selected")) {
					var toppingIndex = designedPizza[sideToppings].indexOf(optionId);
					
					designedPizza[sideToppings].splice(toppingIndex, 1);
					if(side == "left" || side == "both") leftToppingStates[optionId].erasing = true;
					if(side == "right" || side == "both") rightToppingStates[optionId].erasing = true;
					
					$option.removeClass("selected");
					$parentOption.find(".toppingSelector").removeClass("selected");
				}
				else {
					if(
						(
							sideToppings == "leftToppings"
							&& leftToppingCount < 10
						)
						|| (
							sideToppings == "rightToppings"
							&& rightToppingCount < 10
						)
						||	(
							sideToppings == "bothToppings"
							&& (
								(leftToppingCount < 10 && rightToppingCount < 10)
								|| ($option.siblings(".leftSide").hasClass("selected") && rightToppingCount < 10)
								|| ($option.siblings(".rightSide").hasClass("selected") && leftToppingCount < 10)
							)
						)
						|| (
							sideToppings != "bothToppings"
							&& $option.siblings(".bothSides").hasClass("selected")
						)
					) {
						var $selectedSideSelectors = $option.siblings(".selected");
						var optionData = designerOptionMap[optionId];
						
						if ($selectedSideSelectors.length > 0) {
							var selectedSide = deriveSide($selectedSideSelectors.attr("class"));
							var selectedSideToppings = selectedSide + "Toppings";
							var toppingIndex = designedPizza[selectedSideToppings].indexOf(optionId);
							
							designedPizza[selectedSideToppings].splice(toppingIndex, 1);
							if(selectedSide == "left" || selectedSide == "both") leftToppingStates[optionId].erasing = true;
							if(selectedSide == "right" || selectedSide == "both") rightToppingStates[optionId].erasing = true;
						}
						
						designedPizza[sideToppings].push(optionId);
						if(side == "left" || side == "both") {
							if(leftToppingStates[optionId]) leftToppingStates[optionId].erasing = false;
							else leftToppingStates[optionId] = newToppingState(optionData, "left");
						}
						if(side == "right" || side == "both") {
							if(rightToppingStates[optionId]) rightToppingStates[optionId].erasing = false;
							else rightToppingStates[optionId] = newToppingState(optionData, "right");
						}
						
						if (
							((
								(sideToppings == "leftToppings" || sideToppings == "bothToppings")
								&& ($selectedSideSelectors.length == 0 || $selectedSideSelectors.hasClass("rightSide"))
								&& leftToppingCount == 4
							)
							|| (
								(sideToppings == "rightToppings" || sideToppings == "bothToppings")
								&& ($selectedSideSelectors.length == 0 || $selectedSideSelectors.hasClass("leftSide"))
								&& rightToppingCount == 4
							))
							&& !warnedAtFiveToppings
						) {
							notifyUser("fiveToppings");
							warnedAtFiveToppings = true;
						}
						
						$selectedSideSelectors.removeClass("selected");
						$option.addClass("selected");
					}
					else notifyUser("tenToppings");
				}
			}
			
			leftToppingCount = designedPizza.leftToppings.length + designedPizza.bothToppings.length;
			rightToppingCount = designedPizza.rightToppings.length + designedPizza.bothToppings.length;
			$("#leftToppingCounter .toppingCount").text(leftToppingCount);
			$("#rightToppingCounter .toppingCount").text(rightToppingCount);
			
			if(!visualizing) visualizePizza();
			else updatedWhileVisualizing = true;
		}
	}
	
	function unlockAfterLoading() {
		visualizePizza();
		$pizzaDesigner.find(".pizzaOption,.toppingSelector,.sideSelector").removeClass("disabledUntilLoaded").click(updatePizza).mousedown(preventDefault);
		editing = loadOptions();
	}

	function searchOptionCategories(categoryId, categoryData) {
		function searchOptions(optionId, optionData) {
			function loadImage(key, src) {
				var img = document.createElement("img");

				function incrementLoadCount() {
					imagesLoaded++;
					if(imagesLoaded == imageCount) unlockAfterLoading();
				}

				function handleImageError() {
					console.log(error);
					imageError = true;
					$(visualizer).addClass("disabled");
					notifyUser("imageError");
					unlockAfterLoading();
				}

				img.addEventListener("load", incrementLoadCount);
				img.addEventListener("error", handleImageError);

				img.src = src;
				optionData[key] = img;
				imageCount++;
			}

			if(optionData.image) loadImage("image", optionData.image);
			if(optionData.meltedImage) loadImage("meltedImage", optionData.meltedImage);
		}

		$.each(categoryData, searchOptions);
	}

	function fixDesignerPageSizes() {
		var $designerPageContainer = $pizzaDesigner.find("#designerPages");
		var $designerPageList = $designerPageContainer.find(".designerPage");
		var $amountOptionList = $designerPageList.find(".amountOption");

		var maxPageWidth = $designerPageContainer.width();
		var maxAmountOptionWidth = 0;

		function fixWidth(index, page) {
			var $page = $(page);
						
			if($page.outerWidth() > maxPageWidth) $page.addClass("widthFixed");
		}

		function getMaxAmountOptionWidth(index, option) {
			var $amountOption = $(option);
			var amountOptionWidth = $amountOption.width() + 1;

			if(amountOptionWidth > maxAmountOptionWidth) maxAmountOptionWidth = amountOptionWidth;
		}

		function fixHeight() {
			var maxPageHeight = 0;

			function findTallest(index, page) {
				var $page = $(page);
				var pageHeight = $page.outerHeight() + 1;

				if (pageHeight > maxPageHeight) maxPageHeight = pageHeight;
			}

			$designerPageList.each(findTallest);
			$designerPageContainer.height(maxPageHeight);
		}
		
		$designerPageContainer.css("height", "");
		$designerPageList.removeClass("widthFixed");
		$amountOptionList.css("width", "");

		$designerPageList.each(fixWidth);
		$amountOptionList.each(getMaxAmountOptionWidth);
		$amountOptionList.width(maxAmountOptionWidth);

		requestAnimationFrame(fixHeight);
	}

	function updatePrice() {
		var $itemChoices = $pizzaDesigner.find(".itemChoices");

		var toppingCount = (leftToppingCount + rightToppingCount) / 2;
		var basePrice = floorPrice(
			designerOptionMap[designedPizza.size].price
			+ designerOptionMap[designedPizza.crust].price
			+ designerOptionMap[designedPizza.sauceAmount].price
			+ designerOptionMap[designedPizza.cheeseAmount].price
			+ (designerOptionMap[designedPizza.size].toppingPrice * Math.max(0, toppingCount - 1))
		);
		var quantity = Number($itemChoices.find(".quantityNumber").text());
		var totalPrice = basePrice * quantity;

		$itemChoices.find(".priceDisplay").text(totalPrice.toFixed(2));
	}

	function updateOrderPage() {
		var pizzaDescription = [];
		var toppingArrays = [];
		var currentIndex = 0;
		var arrayNames = [];

		function pushSideDescriptions(toppingArray) {
			toppingArray = toppingArray.sort();

			function getMostToppingNames() {
				var mostToppingNames = [];
				for (i = 0; i + 1 < toppingArray.length; i++) {
					var toppingName = designerOptionMap[toppingArray[i]].name;

					mostToppingNames.push((toppingName == "Italian Sausage") ? "Italian sausage" : toppingName.toLowerCase());
				}
				return mostToppingNames.join(", ");
			}
			function getLastToppingName() {
				var topping = toppingArray[toppingArray.length - 1];

				return designerOptionMap[topping].name.toLowerCase();
			}

			if (currentIndex == 0) pizzaDescription.push(". It'll have ");
			else if (currentIndex + 1 < toppingArrays.length) pizzaDescription.push(", ");
			else if (currentIndex == 1) pizzaDescription.push(" and ");
			else pizzaDescription.push(", and ");
			if (toppingArray.length > 1) {
				pizzaDescription.push(getMostToppingNames());
				if (toppingArray.length > 2) pizzaDescription.push(",");
				pizzaDescription.push(" and ");
			}
			pizzaDescription.push(getLastToppingName());
			pizzaDescription.push(" on ");
			pizzaDescription.push(arrayNames[currentIndex]);

			currentIndex++;
		}

		if (designedPizza.bothToppings.length > 0) {
			toppingArrays.push(designedPizza.bothToppings);
			arrayNames.push("both sides");
		}
		if (designedPizza.leftToppings.length > 0) {
			toppingArrays.push(designedPizza.leftToppings);
			arrayNames.push("the left side");
		}
		if (designedPizza.rightToppings.length > 0) {
			toppingArrays.push(designedPizza.rightToppings);
			arrayNames.push("the right side");
		}

		if(editing) pizzaDescription.push("So, you want to change your design to a ");
		else pizzaDescription.push("So, you want a ");
		pizzaDescription.push(designerOptionMap[designedPizza.size].name.toLowerCase());
		pizzaDescription.push(" ");
		pizzaDescription.push(designerOptionMap[designedPizza.crust].name.toLowerCase());
		pizzaDescription.push(" pizza, with ");
		if (designedPizza.sauceAmount == "noSauce") pizzaDescription.push("no");
		else {
			var sauceName = designerOptionMap[designedPizza.sauce].name;

			pizzaDescription.push(designerOptionMap[designedPizza.sauceAmount].name.toLowerCase());
			pizzaDescription.push(" ");
			pizzaDescription.push((sauceName == "Alfredo" || sauceName == "BBQ") ? sauceName : sauceName.toLowerCase());
		}
		pizzaDescription.push(" sauce and ");
		pizzaDescription.push((designedPizza.cheeseAmount == "noCheese") ? "no" : designerOptionMap[designedPizza.cheeseAmount].name.toLowerCase());
		pizzaDescription.push(" cheese");
		toppingArrays.forEach(pushSideDescriptions);
		pizzaDescription.push(". If that's right, go ahead and ");
		if(editing) pizzaDescription.push("confirm");
		else pizzaDescription.push("select");
		pizzaDescription.push(" how many of this pizza you want to order!");

		$pizzaDesigner.find("#pizzaDescription").text(pizzaDescription.join(""));
		$pizzaDesigner.find(".orderButton").removeClass("disabled");
		updatePrice();
	}

	function changeActivePage() {
		var $this = $(this);
		if (!$this.hasClass("disabled")) {
			var $page = $this.siblings(".designerPage.active");
			var next = $this.hasClass("nextControl");
			var $newPage = (next) ? $page.next(".designerPage") : $page.prev(".designerPage");

			if ($newPage.length > 0) {
				var $prevControl = $pizzaDesigner.find(".pageChangeControl.previousControl");
				var $nextControl = $pizzaDesigner.find(".pageChangeControl.nextControl");

				$page.removeClass("active");
				$newPage.addClass("active");

				($newPage.prev(".designerPage").length > 0) ? $prevControl.removeClass("disabled") : $prevControl.addClass("disabled");
				($newPage.next(".designerPage").length > 0) ? $nextControl.removeClass("disabled") : $nextControl.addClass("disabled");

				if($newPage.attr("id") == "orderPage") updateOrderPage();
			}
		}
	}

	function sendToCart() {
		var $cartControl = $("#cartControl");
		var newCartItem = {
			"key": "designYourOwn",
			"choiceKey": null,
			"options": {
				"crust": designedPizza.crust,
				"size": designedPizza.size,
				"sauceAmount": designedPizza.sauceAmount,
				"sauce": designedPizza.sauce,
				"cheeseAmount": designedPizza.cheeseAmount,
				"bothToppings": designedPizza.bothToppings,
				"leftToppings": designedPizza.leftToppings,
				"rightToppings": designedPizza.rightToppings
			},
			"quantity": Number($pizzaDesigner.find(".quantityNumber").text())
		};
		
		if(editing) editItemByUid(newCartItem, cartUid, itemUid);
		else addToCart(newCartItem);
	}
	
	function dismissNotification() {$pizzaDesigner.find(".notification.active, #notificationOverlay.active").removeClass("active");}
	
	$.each(designerData, searchOptionCategories);

	$(window).resize(fixDesignerPageSizes);
	fixDesignerPageSizes();

	$pizzaDesigner.find(".pageChangeControl").click(changeActivePage);
	$pizzaDesigner.find(".quantityNumber").on("quantity:change", updatePrice);
	$pizzaDesigner.find(".addToCartButton").click(sendToCart);
});