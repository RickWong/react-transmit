/**
 * @copyright © 2015, Rick Wong. All rights reserved.
 */
"use strict";

var React = require("react");
var assign = React.__spread;

/**
 * @function render
 */
module.exports = function (Component, props, targetDOMNode) {
	var myProps = assign({}, props, window.__reactTransmitPacket || {});

	React.render(React.createElement(Component, myProps), targetDOMNode);
};
