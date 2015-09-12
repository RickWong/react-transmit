/**
 * @copyright © 2015, Rick Wong. All rights reserved.
 */
"use strict";

var promiseProxy = require("./promiseProxy");
var React        = require("./react");
var ReactDOM     = require("./react-dom");
var assign       = React.__spread;

/**
 * @function renderToString
 */
module.exports = function (Component, props) {
	props = props || {};

	return new promiseProxy.Promise(function (resolve, reject) {
		var onQuery = function (promise) {
			promise.then(function (queryResults) {
				var myProps     = assign({}, props, queryResults);
				var reactString = ReactDOM.renderToString(React.createElement(Component, myProps));

				resolve({
					reactString: reactString,
					reactData:   queryResults
				});
			}).catch(function (error) {
				reject(error);
			});
		};

		var myProps = assign({}, props, {onQuery: onQuery});
		ReactDOM.renderToString(React.createElement(Component, myProps));
	});
};
