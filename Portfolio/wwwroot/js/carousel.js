$(document).ready(function() {
	var transitionSpeed = 500;
	var untilRender = 20;
	var transitionSupported = ("transition" in document.body.style);
	var carouselTimeouts = [];
	
	function rotateCarousel($carousel, $control) {
		var $itemContainer = $carousel.children(".carouselItemContainer");
		var $allItems = $itemContainer.children(".carouselItem");
		var $currentItem = $allItems.filter(".currentItem");
		var $allIndicators = $carousel.children(".carouselPlaceDisplay").children(".carouselIndicator");
		var currentPoint = $allIndicators.index($allIndicators.filter(".currentIndicator:first"));
		
		var newPoint;
		var left;
		var steps;
		var rotationSpeed;
		
		function findPercent(index) {
			if(index) return index.toString() + "00%";
			else return "0";
		}
		function findPoint(index, length) {
			while(index < 0) index += length;
			index %= length;
			return index;
		}
		function doRotation() {
			if(left) {
				var $newItem = $currentItem.prev(".carouselItem");
				
				$allItems.first().before($allItems.last());
			}
			else {
				var $newItem = $currentItem.next(".carouselItem");
				
				$allItems.last().after($allItems.first());
			}
			$allItems = $itemContainer.children(".carouselItem");
			
			$itemContainer.addClass("noTransition").css("right", findPercent($allItems.index($currentItem[0])));
			$currentItem.removeClass("currentItem");
			$newItem.addClass("currentItem");
			$currentItem = $allItems.filter(".currentItem");
			
			steps--;
			setTimeout(animateRotation, untilRender);
		}
		function rotationDone() {
			$itemContainer.css("transition-duration","").removeClass("sequentialTransition");
			$carousel.attr("data-rotating","0");
			if($carousel.attr("data-automatic") == "1") carouselTimeouts[$carousel.attr("data-index")] = setTimeout(function(){rotateCarousel($carousel, $carousel.children(".carouselRight"))}, $carousel.attr("data-automaticDelay") - transitionSpeed);
		}
		function animateRotation() {
			var callback = (steps > 0) ? doRotation : rotationDone;
			
			$itemContainer.removeClass("noTransition");
			if(transitionSupported) {
				$itemContainer.css("right", findPercent($allItems.index($currentItem[0])));
				setTimeout(callback, rotationSpeed);
			}
			else $itemContainer.animate({right: findPercent($allItems.index($currentItem[0]))}, rotationSpeed, callback);
		}
		
		if($control.hasClass("carouselRight")) {
			newPoint = findPoint(currentPoint + 1, $allIndicators.length);
			left = false;
			steps = 1;
		}
		else if($control.hasClass("carouselLeft")) {
			newPoint = findPoint(currentPoint - 1, $allIndicators.length);
			left = true;
			steps = 1;
		}
		else {
			newPoint = $allIndicators.index($control);
			if(currentPoint < newPoint) {
				left = false;
				steps = newPoint - currentPoint;
			}
			else {
				left = true;
				steps = currentPoint - newPoint;
			}
		}
		rotationSpeed = Math.floor(transitionSpeed / steps) - untilRender;
		
		$carousel.attr("data-rotating","1");
		$itemContainer.css("transition-duration", rotationSpeed + "ms");
		if(steps > 1) $itemContainer.addClass("sequentialTransition");
		$allIndicators.filter(".currentIndicator").removeClass("currentIndicator");
		$allIndicators.eq(newPoint).addClass("currentIndicator");
		doRotation();
	}
	
	function handleControls(event) {
		var $control = $(event.target);
		var $carousel = $(event.target).closest(".carousel");
		
		function resumeRotation() {
			$carousel.attr("data-automatic","1");
			rotateCarousel($carousel, $carousel.children(".carouselRight"));
		}
		
		if($carousel.attr("data-automatic") == "1") {
			$carousel.attr("data-automatic","0");
			clearTimeout(carouselTimeouts[$carousel.attr("data-index")]);
			
			if($carousel.attr("data-delayedResume") == "1") carouselTimeouts[$carousel.attr("data-index")] = setTimeout(resumeRotation, Number($carousel.attr("data-resumeDelay")));
		}
		else if($carousel.attr("data-delayedResume") == "1") {
			clearTimeout(carouselTimeouts[$carousel.attr("data-index")]);
			carouselTimeouts[$carousel.attr("data-index")] = setTimeout(resumeRotation, Number($carousel.attr("data-resumeDelay")));
		}
		
		if($carousel.attr("data-rotating") != "1" && !$control.hasClass("currentIndicator")) {
			rotateCarousel($carousel, $control);
		}
	}
	
	$(".carouselControl,.carouselIndicator").click(handleControls).mousedown(function(event){event.preventDefault;});
	
	$(".carousel").each(function() {
		var $this = $(this);
		var index = $(".carousel").index(this).toString();
		$this.attr("data-index",index);
		
		if($this.attr("data-automatic") == 1) carouselTimeouts[index] = setTimeout(function(){rotateCarousel($this, $this.children(".carouselRight"));}, Math.round($this.attr("data-automaticDelay") / 2));
	});
});