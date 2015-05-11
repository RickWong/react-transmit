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
	options = arguments[1] || {};

	var Container = React.createClass({
		displayName: Component.displayName + "Container",
		propTypes: {
			queryParams: React.PropTypes.object,
			onQuery:     React.PropTypes.func,
			emptyView:   React.PropTypes.oneOfType([
				React.PropTypes.element,
				React.PropTypes.func
	        ])
		},
		statics: {
			queryParams: options.queryParams || {},
			queries:     options.queries || {},
			getQuery:    function (queryName, queryParams) {
				if (!Container.queries[queryName]) {
					throw new Error(Component.displayName + " has no '" + queryName +"' query")
				}

				queryParams = queryParams || {};
				assign(queryParams, Container.queryParams, assign({}, queryParams));

				return Container.queries[queryName](queryParams);
			},
			getAllQueries: function (queryParams, optionalQueryNames) {
				var promises = [];
				optionalQueryNames = optionalQueryNames || [];

				if (typeof optionalQueryNames === "string") {
					optionalQueryNames = [optionalQueryNames];
				}

				Object.keys(Container.queries).forEach(function (queryName) {
					if (optionalQueryNames.length && optionalQueryNames.indexOf(queryName) < 0) {
						return;
					}

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
		setCurrentParams: function(nextParams) {
			var externalQueryParams = this.props && this.props.queryParams || {};
			externalQueryParams = assign({}, externalQueryParams, nextParams);

			var queryParams = {};
			Object.keys(Container.queryParams).forEach(function (queryParam) {
				var val = Container.queryParams[queryParam];
				if (typeof val === "function") {
					val = val(externalQueryParams);
				}
				queryParams[queryParam] = val;
			});

			this.currentParams = assign({}, queryParams, externalQueryParams, nextParams);
		},
		componentWillMount: function () {
			this.setCurrentParams({});

			if (!this.hasQueryResults()) {
				this.setQueryParams();
			}
			else if (this.props.onQuery) {
				this.props.onQuery.call(this, Promise.resolve({}));
			}
		},
		setQueryParams: function (nextParams, optionalQueryNames) {
			var _this = this;

			var promise = new Promise(function (resolve, reject) {
				var props = _this.props || {};
				var promise;

				if (nextParams) {
					_this.setCurrentParams(nextParams);
				}
				promise = Container.getAllQueries(_this.currentParams, optionalQueryNames);

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

					return queryResults;
				});

				resolve(promise);
			});

			if (this.props.onQuery) {
				this.props.onQuery.call(this, promise);
			}

			return promise;
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
				queryParams:    this.currentParams,
				setQueryParams: this.setQueryParams,
				onQuery:        undefined
			};

			// Query results must be guaranteed to render.
			if (!this.hasQueryResults()) {
				return (typeof props.emptyView === "function") ?
				       props.emptyView() :
				       props.emptyView || null;
			}

			return React.createElement(
				Component,
				assign({}, props, state, utilProps)
			);
		}
	});

	return Container;
};
