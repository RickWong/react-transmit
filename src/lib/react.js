/**
 * @copyright © 2015, Rick Wong. All rights reserved.
 */
"use strict";

var React;

try {
	React = eval("require").call(this, "react");
}
catch (error) {
	React = require("react-native");
}

module.exports = React;
