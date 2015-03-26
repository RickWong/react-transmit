import React from "react";
import InlineCss from "react-inline-css";
import Transmit from "lib/react-transmit";

/**
 * @class Like
 */
const Like = React.createClass({
	render () {
		/**
		 * This is a Transmit prop.
		 */
		const {user} = this.props;

		return (
			<li>
				<img src={user.profile_picture.uri}/>
				<h4><a href={user.uri} target="_blank">{user.name}</a></h4>
				<span> likes this.</span>
			</li>
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
