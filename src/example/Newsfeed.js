import React from "react";
import InlineCss from "react-inline-css";
import Transmit from "lib/react-transmit";
import Story from "example/Story";

/**
 * @class Newsfeed
 */
const Newsfeed = React.createClass({
	statics: {
		css: () => `
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
			}`
	},
	onLoadMore () {
		this.props.setQueryParams({
			nextStoryId: this.props.queryParams.nextStoryId + 1
		});
	},
	render () {
		// This is a normal prop.
		const {repositoryUrl} = this.props;

		/**
		 * This is a Transmit prop.
		 */
		const {stories} = this.props;

		return (
			<InlineCss stylesheet={Newsfeed.css()}>
				<main>
					{stories.map((story, key) => {
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
	}
});

/**
 * Like Relay, export a Transmit container instead of the React component.
 */
export default Transmit.createContainer(Newsfeed, {
	queryParams: {
		nextStoryId: 1
	},
	queries: {
		stories (queryParams, prevStories = []) {
			/**
			 * All Transmit queries must return a promise.
			 */
			return Promise.all(
				prevStories.map(
					/**
					 * Turn previous stories into promises so they persist.
 					 */
					(prevStory) => Promise.resolve(prevStory)
				).concat(
					/**
					 *  Add new story as promise.
					 */
					[Story.getQuery("story", {storyId: queryParams.nextStoryId})]
				)
			);
		}
	}
});
