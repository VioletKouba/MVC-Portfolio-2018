$(document).ready(function() {
	var $pizzaMenu = $("#pizzaMenu");
	var $smallMenus = $pizzaMenu.find("#smallMenus");
	
	function synchronizeBlockHeights() {
		var $itemBlocks = $pizzaMenu.find(".itemBlock");
		var $listBlocks = $pizzaMenu.find(".listBlock");
		var maxItemHeight = 0;
		var maxListHeight = 0;
		
		function setMaxHeight(index, element) {
			var $element = $(element);
			var blockHeight = $element.height() + 1;
			
			if($element.hasClass("itemBlock")) {
				if(maxItemHeight < blockHeight) maxItemHeight = blockHeight;
			}
			else if(maxListHeight < blockHeight) maxListHeight = blockHeight;
		}
		
		$itemBlocks.css("height","");
		$listBlocks.css("height","");
		
		if($itemBlocks.css("display") == "inline-block") {
			$itemBlocks.each(setMaxHeight);
			$itemBlocks.height(maxItemHeight);
		}
		if($listBlocks.css("display") == "inline-block") {
			$listBlocks.each(setMaxHeight);
			$listBlocks.height(maxListHeight);
		}
	}
	
	function updatePrice() {
		var $menuItem = $(this).closest(".menuItem");
		var itemId = $menuItem.attr("id");
		var itemData = menuItemMap[itemId];

		var choiceKey = $menuItem.find(".selected").attr("data-key");
		var quantity = Number($menuItem.find(".quantityNumber").text());
		
		var basePrice = (choiceKey) ? itemData.choices[choiceKey].price : itemData.price;
		var totalPrice = (basePrice * quantity);
		
		$menuItem.find(".priceDisplay").text(totalPrice.toFixed(2));
	}
	
	function sendToCart() {
		var newCartItem = {};
		
		var $menuItem = $(this).closest(".menuItem");
		var $itemChoice = $menuItem.find(".itemChoice.selected");
		var $itemQuantity = $menuItem.find(".quantityNumber");
		
		newCartItem.key = $menuItem.attr("id");
		if($itemChoice.length > 0) newCartItem.choiceKey = $itemChoice.attr("data-key");
		else newCartItem.choiceKey = null;
		newCartItem.quantity = Number($itemQuantity.text());
		
		addToCart(newCartItem);
	}
	
	function scrollToCenter($element) {
		var offsetTop = $element.offset().top;
		var offsetCenter = offsetTop + $element.height();
		var absoluteCenter = Math.floor(offsetCenter - ($(window).height() / 2));
		window.scrollTo(0, absoluteCenter);

		$element.on("animationend", resetAnimation).css("animation-name", "highlight");
	}
	
	$(window).resize(synchronizeBlockHeights);
	synchronizeBlockHeights();

	$pizzaMenu.find(".choiceList").on("choice:change", updatePrice);
	$pizzaMenu.find(".quantityNumber").on("quantity:change", updatePrice);
	$pizzaMenu.find(".addToCartButton").click(sendToCart);

	var $anchorTarget = $(location.hash).find(".orderButton");
	if ($anchorTarget.length > 0) {
		$anchorTarget.triggerHandler("click");
		requestAnimationFrame(function() {scrollToCenter($anchorTarget.find(".itemChoices"));});
	}
});