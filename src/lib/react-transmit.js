/**
 * @copyright © 2015, Rick Wong. All rights reserved.
 */
var React = require("react");
var assign = React.__spread;

var createContainer = function (Component, options) {
	options = options || {};
	var queryParams = options.queryParams || {};
	var queries = options.queries || {};

	return React.createClass({
		statics: {
			getQuery: function (query) {
				return queries[query];
			}
		},
		componentWillMount: function () {
			this.setQueryParams(queryParams);
		},
		setQueryParams: function (nextQueryParams) {
			queryParams = assign(queryParams, nextQueryParams);
			this.transmit();
		},
		transmit: function () {
			var promises = [];
			var nextState = {};
			var _this = this;

			for (var query in queries) {
				if (queries.hasOwnProperty(query)) {
					var promise = queries[query](queryParams);
					promise.then(function (value) {
						nextState[query] = value;
					});
					promises.push(promise);
				}
			}

			Promise.all(promises).then(function () {
				_this.setState(nextState);
			});
		},
		render: function () {
			var props = {
				queryParams: queryParams,
				setQueryParams: this.setQueryParams
			};

			return React.createElement(
				Component,
				assign({}, this.state, props, this.props)
			);
		}
	});
};

module.exports = {
	createContainer: createContainer
};
