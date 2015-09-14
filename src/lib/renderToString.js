/**
 * @copyright © 2015, Rick Wong. All rights reserved.
 */
"use strict";

var assign       = require("./assign");
var promiseProxy = require("./promiseProxy");
var React        = require("./react");
var ReactDOM     = require("./react-dom-server");

/**
 * @function renderToString
 */
module.exports = function (Component, props) {
	props = props || {};

	return new promiseProxy.Promise(function (resolve, reject) {
		var onFetch = function (promise) {
			promise.then(function (fetchedResults) {
				var myProps     = assign({}, props, fetchedResults);
				var reactString = ReactDOM.renderToString(React.createElement(Component, myProps));

				resolve({
					reactString: reactString,
					reactData:   fetchedResults
				});
			}).catch(function (error) {
				reject(error);
			});
		};

		var myProps = assign({}, props, {onFetch: onFetch});
		ReactDOM.renderToString(React.createElement(Component, myProps));
	});
};
