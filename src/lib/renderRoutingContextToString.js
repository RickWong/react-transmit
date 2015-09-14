/**
 * @copyright © 2015, Rick Wong. All rights reserved.
 */
"use strict";

var assign          = require("./assign");
var isRootContainer = require("./isRootContainer");
var promiseProxy    = require("./promiseProxy");
var React           = require("./react");
var ReactDOM        = require("./react-dom");

/**
 * @function renderRoutingContextToString
 */
module.exports = function (RoutingContext, renderProps) {
	var waitForFetch = false;

	return new promiseProxy.Promise(function (resolve, reject) {
		renderProps.createElement = function (Component, props) {
			if (isRootContainer(Component)) {
				waitForFetch = true;

				props.onFetch = function (promise) {
					promise.then(function (reactData) {
						renderProps.createElement = function (Component, props) {
							return React.createElement(Component, assign(props, reactData));
						};

						resolve(ReactDOM.renderToString(React.createElement(RoutingContext, renderProps)), reactData);
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
