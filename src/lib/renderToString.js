/**
 * @copyright © 2015, Rick Wong. All rights reserved.
 */
"use strict";

var React  = require("./react");
var assign = React.__spread;

/**
 * @function renderToString
 */
module.exports = function (Component, props) {
	props = props || {};

	return new Promise(function (resolve, reject) {
		var onQueryComplete = function (error, queryResults) {
			if (error) {
				return reject(error);
			}

			var myProps     = assign({}, props, queryResults);
			var reactString = React.renderToString(React.createElement(Component, myProps));

			resolve({
				reactString: reactString,
				reactData: queryResults
			});
		};

		var myProps = assign({}, props, {onQueryComplete: onQueryComplete});
		React.renderToString(React.createElement(Component, myProps));
	});
};
