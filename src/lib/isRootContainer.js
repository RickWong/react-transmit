/**
 * @copyright © 2015, Rick Wong. All rights reserved.
 */
"use strict";

var isContainer = require("./isContainer");

/**
 * @function isContainer
 */
module.exports = function (Container) {
	return !!(isContainer(Container) &&
	          Container.isRootContainer);
};
