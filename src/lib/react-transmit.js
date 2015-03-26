/**
 * @copyright © 2015, Rick Wong. All rights reserved.
 */
"use strict";

var React  = require("react");
var assign = React.__spread;

/**
 * @function createContainer
 */
var createContainer = function (Component, options) {
	var options = arguments[1] || {};

	var Container = React.createClass({
		displayName: Component.displayName + "Container",
		statics: {
			queryParams: options.queryParams || {},
			queries: options.queries || {},
			getQuery: function (query, nextParams, prevResult) {
				nextParams = assign({}, Container.queryParams, nextParams || {});
				return Container.queries[query](nextParams, prevResult);
			}
		},
		componentWillMount: function () {
			this.currentParams = assign({}, Container.queryParams);

			if (!this.hasQueryResults()) {
				this.setQueryParams({});
			}
		},
		componentWillReceiveProps: function (nextProps) {
			/**
			 * Unbranch.
			 */
			this.state = null;
		},
		shouldContainerUpdate: function (nextParams) {
			return options.shouldContainerUpdate ?
			       options.shouldContainerUpdate.apply(this, arguments) :
			       (!this.state || this.currentParams !== nextParams);
		},
		setQueryParams: function (nextParams, callbackFn) {
			var _this = this;

			/**
			 * This container was a node in a Transmit tree, but its own setQueryParams() is
			 * being called so branch this container into its own Transmit tree.
			 */
			if (!this.state && this.props) {
				this.state = this.props;
				this.props = {};
				return this.componentWillMount();
			}

			setTimeout(function () {
				var state     = _this.state || {};
				var props     = _this.props || {};
				var promises  = [];

				if (!_this.shouldContainerUpdate(nextParams)) {
					return;
				}

				assign(_this.currentParams, nextParams);

				for (var queryName in Container.queries) {
					var promise;

					if (!Container.queries.hasOwnProperty(queryName) ||
					    (props && props[queryName] !== undefined)) {
						continue;
					}

					promise = Container.getQuery(queryName, _this.currentParams, state[queryName]);

					promises.push(promise.then(function (promisedValue) {
						var promisedQuery = {};
						promisedQuery[queryName] = promisedValue;
						return promisedQuery;
					}));
				}

				if (!promises.length) {
					return;
				}

				if (!callbackFn) {
					callbackFn = function (queryResults) {
						_this.setState(queryResults);
					};
				}

				Promise.all(promises).then(function (promisedQueries) {
					var queryResults = {};

					promisedQueries.forEach(function (promisedQuery) {
						assign(queryResults, promisedQuery);
					});

					return queryResults;
				}).then(callbackFn);
			}, 0);
		},
		/**
		 * @returns {boolean} true if all queries have results.
		 */
		hasQueryResults: function () {
			var state = this.state || {};
			var props = this.props || {};

			if (!Object.keys(Container.queries).length) {
				return true;
			}

			for (var queryName in Container.queries) {
				if (!Container.queries.hasOwnProperty(queryName) ||
				    props.hasOwnProperty(queryName) ||
				    state.hasOwnProperty(queryName)) {
					continue;
				}

				return false;
			}

			return true;
		},
		/**
		 * @returns {ReactElement} or null
		 */
		render: function () {
			var state     = this.state || {};
			var props     = this.props || {};
			var utilProps = {
				queryParams: this.currentParams,
				setQueryParams: this.setQueryParams
			};

			// Query results must be guaranteed to render.
			if (!this.hasQueryResults()) {
				return null;
			}

			return React.createElement(
				Component,
				assign({}, props, state, utilProps)
			);
		}
	});

	return Container;
};

module.exports = {
	createContainer: createContainer
};
