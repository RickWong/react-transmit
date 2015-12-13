import React from "react";
import InlineCss from "react-inline-css";
import Transmit from "lib/react-transmit";
import Like from "example/Like";
import githubRest from "./githubRest";

/**
 * @class Story
 */
const Story = React.createClass({
	render () {
		/**
		 * This prop is guaranteed.
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
 *  Higher-order component that will fetch data for the above React component.
 */
export default Transmit.createContainer(Story, {
	fragments: {
		/**
		 * The "story" fragment will fetch some GitHub users as likers, and returns
		 * a Promise to the new Story object.
		 */
		story ({storyId}) {
			if (!storyId) {
				throw new Error("storyId required");
			}

			return (
				githubRest.browse(
					["repos", "RickWong/react-transmit", "stargazers"],
					{query: {per_page: 60, page: storyId}}
				).then((stargazers) => {
					/**
					 * Chain a promise that maps GitHub users into likers.
					 */
					return Promise.all(
						stargazers.map((stargazer) => Like.getFragment("like", {stargazer}))
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
