import React from "react";
import InlineCss from "react-inline-css";
import Transmit from "lib/react-transmit";

/**
 * @class Story
 */
const Story = React.createClass({
	statics: {
		css: () => `
			& {
				padding: 12px;
				background: #fff;
				border: 1px solid #e5e5e5;
				border-radius: 3px;
				margin-bottom: 8px;
			}
			& img {
				float: left;
				border: 1px solid #e5e5e5;
				margin: 0 6px 12px 0;
			}
			& h4 {
				color: #3b5998;
				margin: 5px 0;
			}
			& span {
				color: #bbb;
				font-size: 12px;
			}
			& div {
				clear: both;
			}`
	},
	render() {
		var story = this.props.story;

		if (!story) {
			return null;
		}

		return (
			<InlineCss stylesheet={Story.css()} namespace="Story">
				<img src={story.author.profile_picture.uri} />
				<h4>{story.author.name}</h4>
				<span>Mar 22</span>
				<div>{story.text}</div>
			</InlineCss>
		);
	}
});

export default Transmit.createContainer(Story, {
	queries: {
		story (queryParams) {
			return new Promise(function (resolve, reject) {
				var story = {
					author: {
						name:            "Rick Wong",
						profile_picture: {
							uri: "https://avatars3.githubusercontent.com/u/40102?v=3&s=40"
						}
					},
					text:   "React Transmit. A Relay-ish library."
				};

				resolve(story);
			});
		}
	}
});
