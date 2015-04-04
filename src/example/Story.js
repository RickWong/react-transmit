import _fetch from "isomorphic-fetch";
import React from "react";
import InlineCss from "react-inline-css";
import Transmit from "lib/react-transmit";
import Like from "example/Like";

/**
 * @class Story
 */
const Story = React.createClass({
	render () {
		/**
		 * Transmitted prop is guaranteed.
		 */
		const story = this.props.story;

		return (
			<InlineCss stylesheet={Story.css()}>
				<section>
					<h3>
						<img src="./favicon.ico" />
						<a href={story.url}>{story.title}</a>
					</h3>
					<p>
						{story.text}
					</p>
					<a href={story.url + "/stargazers"}>Like</a>
					<span> · </span>
					<a href={"https://twitter.com/intent/tweet?text=React%20Transmit:%20a%20Relay-inspired+library+based+on+Promises+instead+of+GraphQL.%20" + story.url + "%20@rygu%20@reactjs"} target="_blank">Share</a>
				</section>
				<ul>
					{story.likes.map((like, key) => <Like like={like} key={key} />)}
				</ul>
				<hr />
			</InlineCss>
		);
	}
});

/**
 *  Higher-Order Transmit component that will contain the above React component.
 */
export default Transmit.createContainer(Story, {
	/**
	 * Default query params.
	 */
	queryParams: {
		storyId: null
	},
	queries: {
		/**
		 * The "story" query will fetch some stargazers for the next Story, and returns
		 * the next Story in a Promise.
		 */
		story (queryParams) {
			if (!queryParams.storyId) {
				throw new Error("queryParams.storyId required");
			}

			return (
				fetch(
					"https://api.github.com/repos/RickWong/react-transmit/stargazers" +
					`?per_page=60&page=${queryParams.storyId}`
				).then((response) => {
					if (!response.ok) {
						throw new Error(response.statusText);
					}

					return response.json();
				}).then((stargazers) => {
					/**
					 * Chain a promise that maps stargazers into likes.
					 */
					return Promise.all(
						stargazers.map((user) => Like.getQuery("like", {user}))
					);
				}).then((likes) => {
					/**
					 * Just the same story everytime but with different likes :)
					 */
					return {
						title: "React Transmit",
						text: "Relay-inspired library based on Promises instead of GraphQL.",
						url: "https://github.com/RickWong/react-transmit",
						likes: likes
					};
				})
			);
		}
	}
});

/**
 * Style this example app like a Facebook feed.
 */
Story.css = function () {
	return `
		& {
			margin-top: 10px;
		}
		& > section {
			padding: 10px 12px;
			background: #fff;
			border: 1px solid #e1e1e1;
			border-radius: 3px 3px 0 0;
			font-size: 14px;
		}
		& > section img {
			float: left;
			width: 40px;
			height: 40px;
			margin-right: 8px;
			border: 1px solid #e1e1e1;
		}
		& > section h3 {
			margin: 0 0 10px 0;
			float: left;
			line-height: 40px;
		}
		& > section p {
			clear: both;
		}
		& > section > a {
			color: #6d84b4;
			font-size: 13px;
		}
		& > ul {
			margin: 0;
			padding: 0;
			list-style: none;
			border: 1px solid #e1e1e1;
			border-width: 0 1px 1px;
			background: #f6f7f8;
			float: left;
			width: 100%;
			border-radius: 0 0 3px 3px;
		}
		& > ul li {
			padding: 2px 12px;
			float: left;
			width: 50%;
			font-size: 12px;
		}
		& > ul img {
			float: left;
			border: 1px solid #e1e1e1;
			margin-right: 6px;
			width: 20px;
			height: 20px;
		}
		& > ul h4 {
			display: inline-block;
			margin: 4px 0;
		}
		& > hr {
			border: none;
			clear: both;
		}
	`;
};
