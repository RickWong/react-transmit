/**
 * @copyright © 2015, Rick Wong. All rights reserved.
 */
"use strict";

function assignProperty (object, key, value) {
	if (typeof object === "object") {
		object[key] = value;
	}

	return object;
}

module.exports = assignProperty;
