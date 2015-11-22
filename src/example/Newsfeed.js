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
					{newsfeed && newsfeed.map((story, key) => {
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
		 * Call this.props.transmit.forceFetch() to re-fetch fragments with new variables.
		 */
		this.props.transmit.forceFetch({
			existingNewsfeed: this.props.newsfeed,
			nextStoryId:      this.props.transmit.variables.nextStoryId + 1
		}).then((fetchedFragments) => {
			/**
			 * Optional. Like onFetch() you can capture the fetched data or handle any errors.
 			 */
			console.log("Newsfeed forceFetch: ", fetchedFragments);
		});
	}
});

/**
 *  Higher-order component that will fetch data for the above React component.
 */
export default Transmit.createContainer(Newsfeed, {
	/**
	 * Default variables.
	 */
	initialVariables: {
		existingNewsfeed: [],
		nextStoryId:      1
	},
	fragments: {
		/**
		 * The "newsfeed" fragment fetches the next Story, and returns a Promise to a newsfeed that
		 * is the existing newsfeed concatenated with the next Story.
		 *
		 * Actually this Promise is marked as deferred, since it's wrapped in a function.
		 */
		newsfeed ({existingNewsfeed, nextStoryId}) {
			return () => Story.getFragment(
				"story", {storyId: nextStoryId}
			).then((nextStory) => {
				return existingNewsfeed.concat([nextStory]);
			});
		}
	},
	shouldContainerUpdate (nextVariables) {
		return this.variables.nextStoryId < nextVariables.nextStoryId;
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
