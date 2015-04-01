/**
 * @copyright © 2015, Rick Wong. All rights reserved.
 */
"use strict";

var React  = require("./react");
var assign = React.__spread;

/**
 * @function renderToString
 */
module.exports = function (Component, props, callbackFn) {
	var onQueryComplete = function (error, queryResults) {
		if (error) {
			return callbackFn(error);
		}

		var myProps = assign({}, props, queryResults);

		callbackFn(
			null,
			React.renderToString(
				React.createElement(Component, myProps)
			),
			queryResults
		);
	};

	var myProps = assign({}, props, {
		onQueryComplete: onQueryComplete
	});

	React.renderToString(React.createElement(Component, myProps));
};
