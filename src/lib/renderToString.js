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
		var onQuery = function (promise) {
			promise.then(function (queryResults) {
				var myProps     = assign({}, props, queryResults);
				var reactString = React.renderToString(React.createElement(Component, myProps));

				resolve({
					reactString: reactString,
					reactData: queryResults
				});
			}).catch(function (error) {
				reject(error);
			});
		};

		var myProps = assign({}, props, {onQuery: onQuery});
		React.renderToString(React.createElement(Component, myProps));
	});
};
