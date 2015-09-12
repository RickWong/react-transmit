/**
 * @copyright © 2015, Rick Wong. All rights reserved.
 */
"use strict";

var promiseProxy = require("./promiseProxy");
var React        = require("./react");
var assign       = require("./assign");

/**
 * @function createContainer
 * @returns {ReactClass}
 */
module.exports = function (Component, options) {
	options = arguments[1] || {};

	var Container = React.createClass({
		displayName: (Component.displayName || Component.name) + "Container",
		propTypes: {
			variables:             React.PropTypes.object,
			onFetch:               React.PropTypes.func,
			renderLoading:         React.PropTypes.oneOfType([
				React.PropTypes.element,
				React.PropTypes.func
			])
		},
		statics: {
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

				return Container.fragments[fragmentName](variables);
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
						var fragmentResults = {};
						fragmentResults[fragmentName] = fragmentResult;

						return fragmentResults;
					});

					promises.push(promise);
				});

				if (!promises.length) {
					promises.push(promiseProxy.Promise.resolve(true));
				}

				return promiseProxy.Promise.all(
					promises
				).then(function (promisedFragments) {
					var fetchedFragments = {};

					promisedFragments.forEach(function (promisedFragment) {
						if (typeof promisedFragment === "object") {
							assign(fetchedFragments, promisedFragment);
						}
					});

					return fetchedFragments;
				});
			},
		},
		/**
		 * @returns {Promise|Boolean}
		 */
		forceFetch: function (nextVariables, optionalFragmentNames) {
			var _this = this;

			if (options.shouldContainerUpdate && Object.keys(nextVariables).length) {
				if (!options.shouldContainerUpdate.call(this, nextVariables)) {
					return false;
				}
			}

			var promise = new promiseProxy.Promise(function (resolve, reject) {
				var props = _this.props || {};
				var promise;

				assign(_this.variables, nextVariables || {});
				promise = Container.getAllFragments(_this.variables, optionalFragmentNames);

				promise.then(function (fetchedFragments) {
					// See `isMounted` discussion at https://github.com/facebook/react/issues/2787
					if (!_this.isMounted()) {
						return fetchedFragments;
					}

					try {
						_this.setState(fetchedFragments);
					}
					catch (error) {
						// Call to setState may fail if renderToString() was used.
						if (!error.message || !error.message.match(/^document/)) {
							throw error;
						}
					}

					return fetchedFragments;
				});

				resolve(promise);
			});

			if (this.props.onFetch) {
				this.props.onFetch.call(this, promise);
			}

			return promise;
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
				this.forceFetch({});
			}
			else if (this.props.onFetch) {
				this.props.onFetch.call(this, promiseProxy.Promise.resolve({}));
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

			return React.createElement(
				Component,
				assign({}, props, state, {transmit: transmit})
			);
		}
	});

	return Container;
};
