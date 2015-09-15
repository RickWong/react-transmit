/**
 * @copyright © 2015, Rick Wong. All rights reserved.
 */
"use strict";

var ReactElement = require("./ReactElement");

/**
 * @function overrideCreateElement
 */
module.exports = function (replacement, callback) {
	var originalCreateElement = ReactElement.createElement;

	ReactElement.createElement = function (t, p, c) {
		var args = Array.prototype.slice.call(arguments);

		return replacement.apply(null, [originalCreateElement].concat(args));
	};

	callback();

	ReactElement.createElement = originalCreateElement;
};
