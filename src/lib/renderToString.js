/**
 * @copyright © 2015, Rick Wong. All rights reserved.
 */
"use strict";

var isRootContainer       = require("./isRootContainer");
var overrideCreateElement = require("./overrideCreateElement");
var promiseProxy          = require("./promiseProxy");
var React                 = require("./react");
var ReactDOM              = require("./react-dom-server");

/**
 * @function renderToString
 */
module.exports = function (Component, props) {
	props = props || {};

	return new promiseProxy.Promise(function (resolve, reject) {
		var promises = [];
		var myProps  = Object.assign({}, props);

		var reactString;

		overrideCreateElement(
			function (originalCreateElement, type, props, children) {
				var args = [].slice.call(arguments, 1);

				if (isRootContainer(type)) {
					props.onFetch = function (promise) {
						promises.push(promise);
					};
				}

				return originalCreateElement.apply(null, args);
			},
			function () {
				Object.assign(myProps, {createElement: React.createElement});
				reactString = ReactDOM.renderToString(React.createElement(Component, myProps));
			}
		);

		if (!promises.length) {
			resolve({reactString: reactString, reactData: []});
		}
		else {
			promiseProxy.Promise.all(promises).then(function (fetchedFragments) {
				var reactString;
				var reactData = fetchedFragments.slice(0);

				overrideCreateElement(
					function (originalCreateElement, type, props, children) {
						var args = [].slice.call(arguments, 1);

						if (isRootContainer(type) && fetchedFragments.length) {
							Object.assign(props, fetchedFragments.pop());
						}

						return originalCreateElement.apply(null, args);
					},
					function () {
						Object.assign(myProps, {createElement: React.createElement});
						reactString = ReactDOM.renderToString(React.createElement(Component, myProps));
					}
				);

				resolve({
					reactString: reactString,
					reactData:   reactData
				});
			}).catch(function (error) {
				reject(error);
			});
		}
	});
};
