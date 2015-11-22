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
					return new promiseProxy.Promise(function (resolve, reject) {
						resolve(promise);
					});
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
		deferredFragments: {},
		componentDidMount: function () {
			// Keep track of the mounted state manually, because the official isMounted() method
			// returns true when using renderToString() from react-dom/server.
			this._mounted = true;
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
		forceFetch: function (nextVariables, optionalFragmentNames) {
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

			var fetchPromise = new promiseProxy.Promise(function (resolve, reject) {
				var promise;

				assign(_this.variables, nextVariables);
				promise = Container.getAllFragments(_this.variables, optionalFragmentNames);

				promise.then(function (fetchedFragments) {
					Object.keys(fetchedFragments).forEach(function (key) {
						if (typeof fetchedFragments[key] !== "function") {
							return;
						}

						assignProperty(_this.deferredFragments, key, fetchedFragments[key]);

						// Set to null so component is allowed to be rendered.
						fetchedFragments[key] = null;
					});

					_this.safeguardedSetState(fetchedFragments);

					return fetchedFragments;
				});

				resolve(promise);
			});

			_this.callOnFetchHandler(fetchPromise);

			return fetchPromise;
		},
		fetchRemainingDeferred: function () {
			if (!this._isMounted()) {
				return;
			}

			var _this = this;

			Object.keys(_this.deferredFragments).forEach(function (key) {
				var fetchPromise = _this.deferredFragments[key]().then(function (deferredFragment) {
					var fetchedDeferred = assignProperty({}, key, deferredFragment);

					_this.safeguardedSetState(fetchedDeferred);

					return fetchedDeferred;
				});

				delete _this.deferredFragments[key];

				_this.callOnFetchHandler(fetchPromise);
			});
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
		 * @returns {Boolean} true if all queries have results.
		 */
		hasFetched: function () {
			var state = this.state || {};
			var props = this.props || {};

			if (!Object.keys(Container.fragments).length) {
				return true;
			}

			for (var fragmentName in Container.fragments) {
				if (!Container.fragments.hasOwnProperty(fragmentName) ||
				    props.hasOwnProperty(fragmentName) ||
				    state.hasOwnProperty(fragmentName)) {
					continue;
				}

				return false;
			}

			return true;
		},
		/**
		 */
		componentWillMount: function () {
			var externalVariables = this.props && this.props.variables || {};

			this.variables = assign({}, Container.variables, externalVariables);
			this.variables = Container.prepareVariables(this.variables);

			if (!this.hasFetched()) {
				this.forceFetch();
			}
			else if (this.props.onFetch) {
				this.props.onFetch.call(this, promiseProxy.Promise.resolve({}));
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
			if (!this.hasFetched()) {
				return (typeof props.renderLoading === "function") ?
				       props.renderLoading() :
				       props.renderLoading || null;
			}

			this.fetchRemainingDeferred();

			return React.createElement(
				Component,
				assign({}, props, state, {transmit: transmit})
			);
		}
	});

	return Container;
};
