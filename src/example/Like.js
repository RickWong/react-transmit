import React from "react";
import InlineCss from "react-inline-css";
import Transmit from "lib/react-transmit";

/**
 * @class Like
 */
const Like = React.createClass({
	statics: {
		css: () => `
			& {
				padding: 2px 12px;
				float: left;
				width: 50%;
				font-size: 12px;
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
	render () {
		/**
		 * This is a Transmit prop.
		 */
		const {user} = this.props;

		return (
			<InlineCss stylesheet={Like.css()} wrapper="li">
				<img src={user.profile_picture.uri}/>
				<h4><a href={user.uri} target="_blank">{user.name}</a></h4>
				<span> likes this.</span>
			</InlineCss>
		);
	}
});

/**
 * Like Relay, export a Transmit container instead of the React component.
 */
export default Transmit.createContainer(Like, {
	queryParams: {
		user: null
	},
	queries: {
		user (queryParams) {
			if (!queryParams.user) {
				throw new Error("queryParams.user required");
			}

			/**
			 * All Transmit queries must return a promise.
			 */
			return Promise.resolve({
				name: queryParams.user.login,
				uri: queryParams.user.html_url,
				profile_picture: {
					uri: `${queryParams.user.avatar_url}&s=20`
				}
			});
		}
	}
});
