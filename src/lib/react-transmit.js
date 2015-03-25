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
	var _queryParams, _queries;
	
	options      = options || {};
	_queryParams = options.queryParams || {};
	_queries     = options.queries || {};

	return React.createClass({
		statics: {
			getQuery: function (query, nextParams, prevResult) {
				nextParams = assign({}, _queryParams, nextParams || {});
				return _queries[query](nextParams, prevResult);
			}
		},
		componentWillMount: function () {
			this.setQueryParams({});
		},
		shouldContainerQuery: function (currentParams, nextParams) {
			return options.shouldContainerQuery ?
			       options.shouldContainerQuery.apply(this, arguments) :
			       currentParams !== nextParams;
		},
		setQueryParams: function (nextParams) {
			var _this = this;

			setTimeout(function () {
				var state     = _this.state || {};
				var props     = _this.props || {};
				var nextState = {};
				var promises  = [];
				var promise;

				if (!_this.shouldContainerQuery(_queryParams, nextParams)) {
					return;
				}

				assign(_queryParams, nextParams);

				for (var query in _queries) {
					if (!_queries.hasOwnProperty(query)) {
						continue;
					}

					if (props[query] !== undefined) {
						nextState[query] = props[query];
						continue;
					}

					promise = _this.constructor.getQuery(query, {}, state[query]);

					promises.push(promise.then(function (value) {
						nextState[query] = value;
					}));
				}

				if (!promises.length) {
					return;
				}

				Promise.all(promises).then(function () {
					_this.setState(nextState);
				});
			}, 0);
		},
		/**
		 * @returns {boolean} true if all queries have results.
		 */
		hasQueryResults: function () {
			var state = this.state || {};
			var props = this.props || {};

			if (!Object.keys(_queries).length) {
				return true;
			}

			for (var query in _queries) {
				if (!_queries.hasOwnProperty(query) ||
				    props.hasOwnProperty(query) ||
				    state.hasOwnProperty(query)) {
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
			var state        = this.state || {};
			var props        = this.props || {};
			var utilityProps = {
				queryParams: _queryParams,
				setQueryParams: this.setQueryParams
			};

			// Query results must be guaranteed to render.
			if (!this.hasQueryResults()) {
				return null;
			}

			return React.createElement(
				Component,
				assign({}, props, state, utilityProps)
			);
		}
	});
};

module.exports = {
	createContainer: createContainer
};
