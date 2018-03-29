$(document).ready(function() {
	var transitionSupported = ("transition" in document.body.style);
	var $drawer = $("#siteNav");
	var $close = $("#navClose");
	var $open = $("#navOpen");
	
	function toggleDrawer(event) {
		var isOpen = $drawer.hasClass("openDrawer");
		var control = event.target.id;
		
		if(!isOpen && control == "navOpen" || isOpen && control == "navClose") {
			$drawer.toggleClass("openDrawer");
			if(!transitionSupported) {
				var disappearStyles = {
					backgroundColor: "rgba(0, 0, 0, 0)",
					fontSize: "0",
					opacity: "0",
					padding: "26px"
				}
				
				$drawer.add($drawer.children(".drawerControl")).stop(true);
				
				if(isOpen) {
					$drawer.animate({left: "-142px"}, 250);
					$close.animate(disappearStyles, 100);
					$open.animate({
						backgroundColor: "#303030",
						fontSize: "24px",
						opacity: "0.8",
						padding: "14px"
					}, 100);
				}
				else {
					$drawer.animate({left: "0"}, 250);
					$close.animate({
						backgroundColor: "#303030",
						fontSize: "24px",
						opacity: "0.8",
						padding: "12px 11px 10px"
					}, 100);
					$open.animate(disappearStyles, 100);
				}
			}
		}
	}
	
	if(!transitionSupported) {
		$drawer.css("left", $drawer.css("left"));
		$close.css("background-color", $close.css("background-color")).css("font-size", $close.css("font-size")).css("opacity", $close.css("opacity")).css("padding", $close.css("padding"));
		$open.css("background-color", $open.css("background-color")).css("font-size", $open.css("font-size")).css("opacity", $open.css("opacity")).css("padding", $open.css("padding"));
	}
		
	$(".drawerControl").click(toggleDrawer);
});