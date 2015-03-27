/**
 * @copyright © 2015, Rick Wong. All rights reserved.
 */
"use strict";

var React  = require("react");
var assign = React.__spread;

/**
 * @function createContainer
 */
module.exports = function (Component, options) {
	var options = arguments[1] || {};

	var Container = React.createClass({
		displayName: Component.displayName + "Container",
		statics: {
			queryParams: options.queryParams || {},
			queries: options.queries || {},
			getQuery: function (queryName, nextParams) {
				if (!Container.queries[queryName]) {
					throw new Error(Component.displayName + " has no '" + queryName +"' query")
				}

				nextParams = nextParams || assign({}, Container.queryParams);
				return Container.queries[queryName](nextParams);
			}
		},
		componentWillMount: function () {
			var setQueryParamsCallback = this.props && this.props.setQueryParamsCallback;
			var externalQueryParams = this.props && this.props.queryParams || {};

			this.currentParams = assign({}, Container.queryParams, externalQueryParams);

			if (!this.hasQueryResults()) {
				this.setQueryParams({}, setQueryParamsCallback);
			}
		},
		setQueryParams: function (nextParams, callbackFn) {
			var _this = this;

			setTimeout(function () {
				var state     = _this.state || {};
				var props     = _this.props || {};
				var promises  = [];

				if (!callbackFn) {
					callbackFn = function (errors, queryResults) {
						if (errors) {
							throw errors;
						}

						_this.setState(queryResults);
					};
				}

				assign(_this.currentParams, nextParams);

				for (var queryName in Container.queries) {
					var promise = Container.getQuery(queryName, _this.currentParams);

					promises.push(promise.then(function (promisedValue) {
						var promisedQuery = {};
						promisedQuery[queryName] = promisedValue;
						return promisedQuery;
					}));
				}

				if (!promises.length) {
					return callbackFn(null, {});
				}

				Promise.all(promises).then(function (promisedQueries) {
					var queryResults = {};

					promisedQueries.forEach(function (promisedQuery) {
						assign(queryResults, promisedQuery);
					});

					callbackFn(null, queryResults);
				}).catch(function (errors) {
					callbackFn(errors, null);
				});
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
