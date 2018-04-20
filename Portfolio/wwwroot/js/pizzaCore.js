$(document).ready(function () {
	var menuData;
	var menuItemMap = {}
	var designerOptionMap = {}

	var $notificationOverlay = $("#notificationOverlay");
	var $orderButtons = $(".orderButton");

	function searchData(key, value) {
		function mapItems(itemKey, itemData) {
			function searchOptions(categoryKey, categoryData) {
				function mapOptions(optionKey, optionData) { designerOptionMap[optionKey] = optionData; }

				$.each(categoryData, mapOptions);
			}

			menuItemMap[itemKey] = itemData;

			if (itemData.options) $.each(itemData.options, searchOptions);
		}

		if (value && value.items) $.each(value.items, mapItems);
		else if (typeof value == "object") $.each(value, searchData);
	}

	function floorPrice(price) { return Math.floor(price * 100) / 100; }

	function notifyUser(notification) {
		$notificationOverlay.find(".notification").removeClass("active").filter("#" + notification).add($notificationOverlay).addClass("active");
	}

	function dismissNotification() { $notificationOverlay.find(".notification.active").addBack().removeClass("active"); }

	function toggleDropDown() {
		var $this = $(this);
		
		if($this.hasClass("orderButton")) {
			if($this.hasClass("droppedDown")) {
				$this.removeClass("droppedDown");
				$("#choicesOverlay").removeClass("active");
			}
			else if(!$this.hasClass("disabled")) {
				$this.addClass("droppedDown");
				$("#choicesOverlay").addClass("active");
			}
		}
		else if($this.attr("id") == "choicesOverlay") {
			$(".orderButton.droppedDown").removeClass("droppedDown");
			$this.removeClass("active");
		}
	}

	function selectChoice() {
		var $choice = $(this);
		$choice.addClass("selected").find(".checked").css("animation-name","pulse").end().siblings(".selected").removeClass("selected").parent(".choiceList").trigger("choice:change");
	}

	function changeQuantity() {
		var $control = $(this);
		var $number = $control.siblings(".quantityNumber");
		var number = Number($number.text());
		
		($control.hasClass("quantityDecrement")) ? number-- : number++;
		if(number > 0 && number < 100) $number.text(number).css("animation-name","pulse").trigger("quantity:change");
	}

	function stopPropagation(event) {event.stopPropagation();}
	function preventDefault(event) {event.preventDefault();}
	function resetAnimation(){$(this).css("animation-name","");}

	menuData = JSON.parse($("#jsonMenuData").html());

	$.each(menuData, searchData);

	$notificationOverlay.find(".dismissNotification").click(dismissNotification);

	$("#choicesOverlay").click(toggleDropDown);
	$orderButtons.click(toggleDropDown).mousedown(preventDefault);
	$orderButtons.find(".itemChoices").click(stopPropagation);
	$orderButtons.find(".itemChoice").click(selectChoice).mousedown(preventDefault);
	$orderButtons.find(".quantityControl").click(changeQuantity).mousedown(preventDefault);
	$orderButtons.find(".quantityNumber").on("animationend", resetAnimation);

	window.menuData = menuData;
	window.menuItemMap = menuItemMap;
	window.designerOptionMap = designerOptionMap;

	window.floorPrice = floorPrice;
	window.notifyUser = notifyUser;
	window.resetAnimation = resetAnimation;
	window.changeQuantity = changeQuantity;
	window.preventDefault = preventDefault;
});