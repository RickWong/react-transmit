import React from "react";
import Transmit from "lib/react-transmit";
import Main from "example/Main";

function onQueryComplete (error, queryResults) {
	if (error) {
		throw error;
	}

	console.log("Main.onQueryComplete: ", queryResults);
}

/**
 * For this client-side only example just use React.render() since there is no prefetched data.
 * For isomorphic rendering using Transmit.render() will automatically render with prefetched data.
 */
React.render(<Main {...{onQueryComplete}} />, document.getElementById("react-root"));

// Transmit.render(Main, {}, document.getElementById("react-root"));
