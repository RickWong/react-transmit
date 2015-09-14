/**
 * @copyright © 2015, Rick Wong. All rights reserved.
 */
"use strict";

var React          = require("./react");
var ReactDOM       = require("./react-dom");
var assign         = require("./assign");
var takeFromMarkup = require("./takeFromMarkup");

/**
 * @function render
 */
module.exports = function (Component, props, targetDOMNode, callback) {
	var myProps = assign({}, props, takeFromMarkup());

	ReactDOM.render(React.createElement(Component, myProps), targetDOMNode, callback);
};
