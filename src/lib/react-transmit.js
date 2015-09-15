/**
 * @copyright © 2015, Rick Wong. All rights reserved.
 */
"use strict";

module.exports = {
	createContainer:              require("./createContainer"),
	injectIntoMarkup:             require("./injectIntoMarkup"),
	isContainer:                  require("./isContainer"),
	isRootContainer:              require("./isRootContainer"),
	render:                       require("./render"),
	renderToString:               require("./renderToString"),
	takeFromMarkup:               require("./takeFromMarkup"),
	setPromiseConstructor:        function (PromiseConstructor) {
		require("./promiseProxy").Promise = PromiseConstructor;
	}
};
