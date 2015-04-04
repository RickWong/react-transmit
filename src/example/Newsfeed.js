import React from "react";
import InlineCss from "react-inline-css";
import Transmit from "lib/react-transmit";
import Story from "example/Story";

/**
 * @class Newsfeed
 */
const Newsfeed = React.createClass({
	render () {
		/**
		 * Transmitted prop is guaranteed.
		 */
		const newsfeed = this.props.newsfeed;

		return (
			<InlineCss stylesheet={Newsfeed.css()}>
				<main>
					{newsfeed.map((story, key) => {
						return <Story story={story} key={key}/>;
					})}
				</main>
				<footer>
					<button onMouseDown={this.onLoadMore}>
						Load more
					</button>
				</footer>
			</InlineCss>
		);
	},
	onLoadMore () {
		/**
		 * Call this.props.setQueryParams() to tell Transmit to query again.
		 */
		this.props.setQueryParams({
			currentNewsfeed:  this.props.newsfeed,
			nextStoryId:      this.props.queryParams.nextStoryId + 1
		}).then((queryResults) => {
			/**
			 * This part is optional. It allows you to capture the quert results.
 			 */
			console.log("Newsfeed.setQueryParams: ", queryResults);
		});
	}
});

/**
 *  Higher-Order Transmit component that will contain the above React component.
 */
export default Transmit.createContainer(Newsfeed, {
	/**
	 * Default query params.
	 */
	queryParams: {
		currentNewsfeed: [],
		nextStoryId:     1
	},
	queries: {
		/**
		 * The "newsfeed" query will concatenate the next Story to the current newsfeed, and returns
		 * the updated newsfeed in a Promise.
		 */
		newsfeed (queryParams) {
			return (
				Story.getQuery(
					"story", {storyId: queryParams.nextStoryId}
				).then((nextStory) => {
					return queryParams.currentNewsfeed.concat([nextStory]);
				})
			);
		}
	}
});

/**
 * Style this example app like a Facebook feed.
 */
Newsfeed.css = function () {
	return `
		& {
			width: 500px;
			margin: 0 auto;
		}
		& > footer {
			text-align: center;
			margin: 20px;
		}
		& button {
			border: 1px solid #ccc;
			background: #f4f4f4;
			padding: 5px 15px;
			border-radius: 3px;
			cursor: pointer;
			outline: 0;
		}
	`;
};
