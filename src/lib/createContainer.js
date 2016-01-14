/**
 * @copyright © 2015, Rick Wong. All rights reserved.
 */
"use strict";

var isRootContainer = require("./isRootContainer");
var promiseProxy    = require("./promiseProxy");
var React           = require("./react");
var assign          = require("./assign");
var assignProperty  = require("./assignProperty");

/**
 * @function createContainer
 * @returns {ReactClass}
 */
module.exports = function (Component, options) {
	options = arguments[1] || {};

	var Container = React.createClass({
		displayName: (Component.displayName || Component.name) + "TransmitContainer",
		propTypes: {
			variables:             React.PropTypes.object,
			onFetch:               React.PropTypes.func,
			renderLoading:         React.PropTypes.oneOfType([
				React.PropTypes.element,
				React.PropTypes.func
			])
		},
		statics: {
			isRootContainer:  !!options.initialVariables,
			variables:        options.initialVariables || {},
			prepareVariables: options.prepareVariables || function (v) { return v; },
			fragments:        options.fragments || {},
			/**
			 * @returns {Promise}
			 */
			getFragment:      function (fragmentName, variables) {
				if (!Container.fragments[fragmentName]) {
					throw new Error(Component.displayName + " has no '" + fragmentName +"' fragment")
				}

				variables = assign({}, Container.variables, variables || {});

				var promise = Container.fragments[fragmentName](variables);

				if (typeof promise === "function" && isRootContainer(Container)) {
					return promiseProxy.Promise.resolve(promise);
				}

				return promise;
			},
			/**
			 * @returns {Promise}
			 */
			getAllFragments: function (variables, optionalFragmentNames) {
				var promises = [];

				optionalFragmentNames = optionalFragmentNames || [];

				if (typeof optionalFragmentNames === "string") {
					optionalFragmentNames = [optionalFragmentNames];
				}

				Object.keys(Container.fragments).forEach(function (fragmentName) {
					if (optionalFragmentNames.length && optionalFragmentNames.indexOf(fragmentName) < 0) {
						return;
					}

					var promise = Container.getFragment(
						fragmentName, variables
					).then(function (fragmentResult) {
						return assignProperty({}, fragmentName, fragmentResult);
					});

					promises.push(promise);
				});

				if (!promises.length) {
					promises.push(promiseProxy.Promise.resolve(true));
				}

				return promiseProxy.Promise.all(
					promises
				).then(function (fetchedFragments) {
					return assign.apply(null, fetchedFragments);
				});
			}
		},
		componentDidMount: function () {
			// Keep track of the mounted state manually, because the official isMounted() method
			// returns true when using renderToString() from react-dom/server.
			this._mounted = true;

			if (isRootContainer(Container)) {
				var promise = this.fetching || Promise.resolve(null);
				var _this = this;

				promise.then(function () {
					var deferredFragments = _this.missingFragments(false);

					if (deferredFragments.length) {
						_this.forceFetch({}, deferredFragments);
					}
				});
			}
		},
		componentWillUnmount: function () {
			this._mounted = false;
		},
		_isMounted: function () {
			// See the official `isMounted` discussion at https://github.com/facebook/react/issues/2787
			return !!this._mounted;
		},
		/**
		 * @returns {Promise|Boolean}
		 */
		forceFetch: function (nextVariables, optionalFragmentNames, skipDeferred) {
			var _this = this;
			nextVariables = nextVariables || {};

			if (!isRootContainer(Container)) {
				throw new Error("Only root Transmit Containers should fetch fragments");
			}

			if (options.shouldContainerUpdate && Object.keys(nextVariables).length) {
				if (!options.shouldContainerUpdate.call(this, nextVariables)) {
					return false;
				}
			}

			assign(_this.variables, nextVariables);
			var fetchPromise = Container.getAllFragments(_this.variables, optionalFragmentNames);

			fetchPromise.then(function (fetchedFragments) {
				var deferredFragments = {};

				Object.keys(fetchedFragments).forEach(function (key) {
					if (typeof fetchedFragments[key] !== "function") {
						return;
					}

					if (skipDeferred) {
						// Set deferred fragment to null so component will be rendered.
						fetchedFragments[key] = null;
					}
					else {
						// Remember and then delete the deferred fragment.
						assignProperty(deferredFragments, key, fetchedFragments[key]);
						delete fetchedFragments[key];
					}
				});

				_this.safeguardedSetState(fetchedFragments);

				if (!skipDeferred) {
					Object.keys(deferredFragments).forEach(function (key) {
						var fetchPromise = deferredFragments[key]().then(function (deferredFragment) {
							var fetchedDeferred = assignProperty({}, key, deferredFragment);

							_this.safeguardedSetState(fetchedDeferred);

							return fetchedDeferred;
						});

						_this.callOnFetchHandler(fetchPromise);
					});
				}

				return fetchedFragments;
			});

			_this.callOnFetchHandler(fetchPromise);

			return fetchPromise;
		},
		callOnFetchHandler: function (fetchPromise) {
			if (this.props && this.props.onFetch) {
				this.props.onFetch.call(this, fetchPromise);
			}
		},
		safeguardedSetState: function (stateChanges) {
			if (!this._isMounted()) {
				return;
			}

			if (!Object.keys(stateChanges).length) {
				return;
			}

			try {
				this.setState(stateChanges);
			}
			catch (error) {
				// Call to setState may fail if renderToString() was used.
				if (!error.message || !error.message.match(/^document/)) {
					throw error;
				}
			}
		},
		/**
		 * @returns {Array} Names of fragments with missing data.
		 */
		missingFragments: function (nullAllowed) {
			var state = this.state || {};
			var props = this.props || {};

			if (!Object.keys(Container.fragments).length) {
				return [];
			}

			var missing = [];

			for (var fragmentName in Container.fragments) {
				if (!Container.fragments.hasOwnProperty(fragmentName) ||
					props.hasOwnProperty(fragmentName) ||
					state.hasOwnProperty(fragmentName)) {
					if (nullAllowed) {
						continue;
					}

					if (props[fragmentName] || state[fragmentName]) {
						continue;
					}
				}

				missing.push(fragmentName);
			}

			return missing;
		},
		/**
		 */
		componentWillMount: function () {
			var externalVariables = this.props && this.props.variables || {};

			this.variables = assign({}, Container.variables, externalVariables);
			this.variables = Container.prepareVariables(this.variables);

			if (isRootContainer(Container)) {
				var missingFragments = this.missingFragments(true);

				if (missingFragments.length) {
					var _this = this;
					this.fetching = this.forceFetch({}, missingFragments, true).then(function () {
						_this.fetching = false;
					});
				}
				else {
					this.callOnFetchHandler(promiseProxy.Promise.resolve({}));
				}
			}
		},
		/**
		 *
		 */
		componentWillReceiveProps: function (nextProps) {
			if (isRootContainer(Container)) {
				this.forceFetch(nextProps.variables);
			}
		},
		/**
		 * @returns {ReactElement} or null
		 */
		render: function () {
			var state     = this.state || {};
			var props     = this.props || {};
			var transmit  = {
				variables:  this.variables,
				forceFetch: this.forceFetch,
				onFetch:    undefined
			};

			// Don't render without data.
			if (this.missingFragments(true).length) {
				return (typeof props.renderLoading === "function") ?
					props.renderLoading() : props.renderLoading || null;
			}

			return React.createElement(
				Component,
				assign({}, props, state, {transmit: transmit})
			);
		}
	});

	return Container;
};
