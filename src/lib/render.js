/**
 * @copyright © 2015, Rick Wong. All rights reserved.
 */
"use strict";

var assign                = require("./assign");
var isRootContainer       = require("./isRootContainer");
var overrideCreateElement = require("./overrideCreateElement");
var React                 = require("./react");
var ReactDOM              = require("./react-dom");
var takeFromMarkup        = require("./takeFromMarkup");

var reactData = takeFromMarkup();

/**
 * @function render
 */
module.exports = function (Component, props, targetDOMNode, callback) {
	var fetchedFragments = reactData;

	overrideCreateElement(
		function (originalCreateElement, type, props, children) {
			var args = [].slice.call(arguments, 1);

			if (isRootContainer(type) && fetchedFragments.length) {
				assign(props, fetchedFragments.pop());
			}

			return originalCreateElement.apply(null, args);
		},
		function () {
			assign(props, {createElement: React.createElement});
			ReactDOM.render(React.createElement(Component, props), targetDOMNode, callback);
		}
	);
};
