$(document).ready(function () {
	function useCustomErrorMessages() {
		var validity = this.validity;
		var $this = $(this);

		if (validity.valueMissing && $this.attr("data-val-required")) this.setCustomValidity($this.attr("data-val-required"));
		else if (validity.tooShort && $this.attr("data-val-length")) this.setCustomValidity($this.attr("data-val-length"));
		else if (validity.typeMismatch && $this.attr("data-val-email")) this.setCustomValidity($this.attr("data-val-email"));
		else if (validity.patternMismatch && $this.attr("data-val-regex")) this.setCustomValidity($this.attr("data-val-regex"));
		else this.setCustomValidity("");
	}

	function hashPasswords() {
		var salt = "1518822624336";

		function replaceValues(index, field) {
			if (field.value) field.value = sha256(field.value + salt);
		}

		$(this).find("input[type = password]").each(replaceValues);
	}

	$(".accountForm").submit(hashPasswords).find("input").on("invalid input", useCustomErrorMessages).filter("#EncryptionAlgorithm").val("SHA-256");
});