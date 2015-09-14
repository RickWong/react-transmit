/**
 * @copyright © 2015, Rick Wong. All rights reserved.
 */
"use strict";

var assign          = require("./assign");
var isRootContainer = require("./isRootContainer");
var promiseProxy    = require("./promiseProxy");
var React           = require("./react");
var ReactDOM        = require("./react-dom-server");

/**
 * @function renderRoutingContextToString
 */
module.exports = function (RoutingContext, renderProps) {
	return new promiseProxy.Promise(function (resolve, reject) {
		var waitForFetch = false;

		renderProps.createElement = function (Component, props) {
			if (isRootContainer(Component)) {
				waitForFetch = true;

				props.onFetch = function (promise) {
					promise.then(function (reactData) {
						renderProps.createElement = function (Component, props) {
							return React.createElement(Component, assign(props, reactData));
						};

						var reactString = ReactDOM.renderToString(React.createElement(RoutingContext, renderProps));

						resolve({
							reactString: reactString,
							reactData:   reactData
						});
					}).catch(function (error) {
						reject(error);
					});
				};
			}

			return React.createElement(Component, props);
		};

		var reactString = ReactDOM.renderToString(React.createElement(RoutingContext, renderProps));

		if (!waitForFetch) {
			resolve(reactString, {});
		}
	});
};
