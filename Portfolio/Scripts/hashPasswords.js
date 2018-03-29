$(document).ready(function () {
	var salt = "1518822624336";

	function hashPasswords(event) {
		var $passwordFields = $(this).find("input[type = password]");

		function replaceValues(index, field) {
			if (field.value) field.value = sha256(field.value + salt);
		}

		$passwordFields.each(replaceValues);
	}

	$(".hashedPasswords").submit(hashPasswords);
});