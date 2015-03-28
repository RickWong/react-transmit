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
		propTypes: {
			queryParams: React.PropTypes.object,
			onQueryComplete: React.PropTypes.func
		},
		statics: {
			queryParams: options.queryParams || {},
			queries: options.queries || {},
			getQuery: function (queryName, queryParams) {
				if (!Container.queries[queryName]) {
					throw new Error(Component.displayName + " has no '" + queryName +"' query")
				}

				queryParams = assign({}, Container.queryParams, queryParams || {});
				return Container.queries[queryName](queryParams);
			},
			getAllQueries: function (queryParams) {
				var promises = [];

				Object.keys(Container.queries).forEach(function (queryName) {
					var promise = Container.getQuery(queryName, queryParams).
						then(function (promisedValue) {
							var promisedQuery = {};
							promisedQuery[queryName] = promisedValue;

							return promisedQuery;
						}).catch(function (error) {
							throw error;
						});

					promises.push(promise);
				});

				if (!promises.length) {
					promises.push(Promise.resolve(true));
				}

				return Promise.all(promises);
			}
		},
		componentWillMount: function () {
			var externalQueryParams = this.props && this.props.queryParams || {};

			this.currentParams = assign({}, Container.queryParams, externalQueryParams);

			if (!this.hasQueryResults()) {
				this.setQueryParams({});
			}
		},
		setQueryParams: function (nextParams) {
			var _this = this;

			setTimeout(function () {
				var state     = _this.state || {};
				var props     = _this.props || {};

				assign(_this.currentParams, nextParams);

				Container.getAllQueries(_this.currentParams).
					then(function (promisedQueries) {
						var queryResults = {};

						promisedQueries.forEach(function (promisedQuery) {
							if (typeof promisedQuery === "object") {
								assign(queryResults, promisedQuery);
							}
						});

						try {
							_this.setState(queryResults);
						}
						catch (error) {
							// Call to setState may fail if renderToString() was used.
						}

						if (props.onQueryComplete) {
							props.onQueryComplete.call(_this, null, queryResults);
						}

						return queryResults;
					}).
					catch(function (error) {
						if (props.onQueryComplete) {
							props.onQueryComplete.call(_this, error, {});
						}
						else {
							throw error;
						}
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
