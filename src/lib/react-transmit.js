/**
 * @copyright © 2015, Rick Wong. All rights reserved.
 */
var React = require("react");
var assign = React.__spread;

/**
 * @function createContainer
 */
var createContainer = function (Component, options) {
	options = options || {};

	var _queryParams = options.queryParams || {};
	var _queries = options.queries || {};

	return React.createClass({
		statics: {
			getQuery: function (query, nextQueryParams) {
				return _queries[query](assign({}, _queryParams, nextQueryParams));
			}
		},
		componentWillMount: function () {
			this.setQueryParams(_queryParams);
		},
		setQueryParams: function (nextQueryParams) {
			var _this = this;

			setTimeout(function () {
				assign(_queryParams, nextQueryParams);
				_this.transmit();
			}, 0);
		},
		transmit: function () {
			var _this = this;
			var promises = [];
			var prevProps = this.state || {};
			var currentProps = this.props || {};
			var nextState = {};

			for (var query in _queries) {
				if (_queries.hasOwnProperty(query) && !currentProps[query]) {
					var promise = _queries[query](_queryParams, prevProps);

					promises.push(promise.then(function (value) {
						nextState[query] = value;
					}));
				}
			}

			Promise.all(promises).then(function () {
				_this.setState(nextState);
			});
		},
		render: function () {
			var props = {
				queryParams: _queryParams,
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
