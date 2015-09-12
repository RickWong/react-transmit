/**
 * @copyright © 2015, Rick Wong. All rights reserved.
 */
"use strict";

/**
 * @function isContainer
 */
module.exports = function (Container) {
	return Container && Container.getFragment && Container.getAllFragments;
};
