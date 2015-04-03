/**
 * @copyright © 2015, Rick Wong. All rights reserved.
 */
"use strict";

var React  = require("./react");
var assign = React.__spread;

/**
 * @function createContainer
 */
module.exports = function (Component, options) {
	var options = arguments[1] || {};

	var Container = React.createClass({
		displayName: Component.displayName + "Container",
		propTypes: {
			queryParams: React.PropTypes.object,
			onQueryComplete: React.PropTypes.func,
			emptyView: React.PropTypes.element
		},
		statics: {
			queryParams: options.queryParams || {},
			queries: options.queries || {},
			getQuery: function (queryName, queryParams) {
				if (!Container.queries[queryName]) {
					throw new Error(Component.displayName + " has no '" + queryName +"' query")
				}

				queryParams = queryParams || {};
				assign(queryParams, Container.queryParams, assign({}, queryParams));

				return Container.queries[queryName](queryParams);
			},
			getAllQueries: function (queryParams) {
				var promises = [];

				Object.keys(Container.queries).forEach(function (queryName) {
					var promise = Container.getQuery(
						queryName, queryParams
					).then(function (queryResult) {
						var queryResults = {};
						queryResults[queryName] = queryResult;

						return queryResults;
					});

					promises.push(promise);
				});

				if (!promises.length) {
					promises.push(Promise.resolve(true));
				}

				return Promise.all(
					promises
				).then(function (promisedQueries) {
					var queryResults = {};

					promisedQueries.forEach(function (promisedQuery) {
						if (typeof promisedQuery === "object") {
							assign(queryResults, promisedQuery);
						}
					});

					return queryResults;
				});
			}
		},
		componentWillMount: function () {
			var externalQueryParams = this.props && this.props.queryParams || {};

			this.currentParams = assign({}, Container.queryParams, externalQueryParams);

			if (!this.hasQueryResults()) {
				this.setQueryParams({});
			}
		},
		setQueryParams: function (nextParams, optionalQueryName) {
			var _this = this;

			return new Promise(function (resolve, reject) {
				var state = _this.state || {};
				var props = _this.props || {};
				var promise;

				assign(_this.currentParams, nextParams);

				if (optionalQueryName) {
					promise = Container.getQuery(
						optionalQueryName, _this.currentParams
					).then(function (queryResult) {
						var queryResults = {};
						queryResults[optionalQueryName] = queryResult;

						return queryResults;
					});
				}
				else {
					promise = Container.getAllQueries(_this.currentParams);
				}

				promise.then(function (queryResults) {
					try {
						_this.setState(queryResults);
					}
					catch (error) {
						// Call to setState may fail if renderToString() was used.
						if (!error.message || !error.message.match(/^document/)) {
							throw error;
						}
					}

					if (props.onQueryComplete) {
						props.onQueryComplete.call(_this, null, queryResults);
					}

					resolve(queryResults);
				}).catch(function (error) {
					if (props.onQueryComplete) {
						props.onQueryComplete.call(_this, error, {});
					}

					reject(error);
				});
			});
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
				return props.emptyView || null;
			}

			return React.createElement(
				Component,
				assign({}, props, state, utilProps)
			);
		}
	});

	return Container;
};
