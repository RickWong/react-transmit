import React from "react";
import Transmit from "lib/react-transmit";
import Main from "example/Main";

function onQuery (promise) {
	promise.then((queryResults) => {
		console.log("Main.onQuery: ", queryResults);
	}).catch((error) => {
		throw error;
	});
}

/**
 * For this client-side only example just use React.render() since there is no prefetched data.
 * For isomorphic rendering using Transmit.render() will automatically render with prefetched data.
 */
React.render(<Main {...{onQuery}} />, document.getElementById("react-root"));

// Transmit.render(Main, {}, document.getElementById("react-root"));
