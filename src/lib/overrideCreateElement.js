/**
 * @copyright © 2015, Rick Wong. All rights reserved.
 */
"use strict";

var React = require("./react");

/**
 * @function overrideCreateElement
 */
module.exports = function (replacement, callback) {
	var originalCreateElement = React.createElement;

	React.createElement = function (t, p, c) {
		var args = [].slice.call(arguments);
		return replacement.apply(null, [originalCreateElement].concat(args));
	};

	callback();

	React.createElement = originalCreateElement;
};
