import _fetch from "isomorphic-fetch";
import React from "react";
import InlineCss from "react-inline-css";
import Transmit from "lib/react-transmit";
import Story from "example/Story";

/**
 * @class Newsfeed
 */
const Newsfeed = React.createClass({
	statics: {
		css: (avatarSize) => `
			& footer {
				text-align: center;
				margin: 12px;
			}`
	},
	onLoadMore (event) {
		event.preventDefault();

		this.props.setQueryParams({
			page: this.props.queryParams.page + 1
		});
	},
	render () {
		// This is a normal property.
		const repositoryUrl = this.props.repositoryUrl;

		/**
		 * This is a Transmit property.
		 */
		const stories = this.props.stories;

		/**
		 * Unlike with Relay, Transmit properties aren't guaranteed.
		 */
		if (!stories) {
			return null;
		}

		return (
			<InlineCss stylesheet={Newsfeed.css()} namespace="Newsfeed">
				<main>
					{stories.map((story, i) => {
						return <Story story={story} key={i} />;
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
		count: 50,
		page: 1
	},
	queries: {
		stories (queryParams, prevProps) {
			const url = `https://api.github.com/repos/RickWong/react-transmit/stargazers?per_page=${queryParams.count}&page=${queryParams.page}`;

			return fetch(url).then((response) => {
				return response.json();
			}).then((stargazers) => {
				let promises = [];

				if (prevProps.stories) {
					promises = prevProps.stories.map((story) => Promise.resolve(story));
				}

				return Promise.all(promises.concat(
					stargazers.map((stargazer) => {
						return Story.getQuery("story", {stargazer});
					})
				));
			});
		}
	}
});
