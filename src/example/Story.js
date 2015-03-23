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
				padding: 6px 12px;
				border: 1px solid #e1e1e1;
				border-width: 0 1px;
				background: #f6f7f8;
				clear: both;
				font-size: 12px;
			}
			&:last-child {
				border-radius: 0 0 3px 3px;
			}
			& img {
				float: left;
				border: 1px solid #e1e1e1;
				margin-right: 6px;
				width: 20px;
				height: 20px;
			}
			& h4 {
				display: inline-block;
				margin: 4px 0;
			}`
	},
	render() {
		const story = this.props.story;

		/**
		 * Unlike with Relay, Transmit properties aren't guaranteed.
 		 */
		if (!story) {
			return null;
		}

		return (
			<InlineCss stylesheet={Story.css()} namespace="Story">
				<img src={story.user.profile_picture.uri} />
				<h4><a href={story.user.url} target="_blank">{story.user.name}</a></h4>
				<span>{story.text}</span>
			</InlineCss>
		);
	}
});

/**
 * Like Relay, export a Transmit container instead of the React component.
 */
export default Transmit.createContainer(Story, {
	queries: {
		story (queryParams, prevProps) {

			return new Promise(function (resolve, reject) {
				resolve({
					user: {
						name:            queryParams.stargazer.login,
						url:             queryParams.stargazer.url,
						profile_picture: {
							uri: `${queryParams.stargazer.avatar_url}&s=20`
						}
					},
					text:   " likes this."
				});
			});
		}
	}
});
