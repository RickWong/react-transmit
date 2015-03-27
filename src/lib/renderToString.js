/**
 * @copyright © 2015, Rick Wong. All rights reserved.
 */
"use strict";

var React = require("react");
var assign = React.__spread;

/**
 * @function renderToString
 */
module.exports = function (Component, props, callbackFn) {
	var setQueryParamsCallback = function (errors, queryResults) {
		if (errors) {
			throw errors;
		}

		var myProps = assign({}, props, queryResults || {}, {
			setQueryParamsCallback: function () {}
		});

		callbackFn(
			React.renderToString(
				React.createElement(Component, myProps)
			),
			queryResults
		);
	};

	var myProps = assign({}, props, {
		setQueryParamsCallback: setQueryParamsCallback
	});

	React.renderToString(React.createElement(Component, myProps));
};
