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
			prevStories: this.props.stories,
			nextStoryId: this.props.queryParams.nextStoryId + 1
		}).then((queryResults) => {
			console.log("Newsfeed.setQueryParams: ", queryResults);
		}).catch((error) => {
			throw error;
		});
	},
	render () {
		const {stories, repositoryUrl} = this.props;

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
		prevStories: [],
		nextStoryId: 1
	},
	queries: {
		stories (queryParams) {
			/**
			 * All Transmit queries must return a promise.
			 */
			return Story.getQuery(
				"story", {storyId: queryParams.nextStoryId}
			).then((nextStory) => {
				return queryParams.prevStories.concat([nextStory]);
			});
		}
	}
});
