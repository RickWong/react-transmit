import React from "react";
import Transmit from "lib/react-transmit";
import Main from "example/Main";

/**
 * Transmit.render() will automatically render with pre-queried data.
 */
try {
	Transmit.render(Main, {}, document.getElementById("react-root"));
}
catch (error) {
	console.warn(error);
}
