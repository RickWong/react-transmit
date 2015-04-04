import React from "react";
import Transmit from "lib/react-transmit";
import Main from "example/Main";

/**
 * For this client-side only example just use React.render() since there is no pre-queried data.
 * For isomorphic rendering using Transmit.render() will automatically render with pre-queried data.
 */
React.render(<Main />, document.getElementById("react-root"));

// Transmit.render(Main, {}, document.getElementById("react-root"));
