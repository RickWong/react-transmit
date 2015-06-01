/**
 * @copyright © 2015, Rick Wong. All rights reserved.
 */
"use strict";

module.exports = {
	Promise: global.Promise || function () {
		throw new Error("Missing ES6 Promise implementation");
	}
};
