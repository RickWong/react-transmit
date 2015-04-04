import React from "react";
import InlineCss from "react-inline-css";
import Transmit from "lib/react-transmit";

/**
 * @class Like
 */
const Like = React.createClass({
	render () {
		/**
		 * Transmitted prop is guaranteed.
		 */
		const like = this.props.like;

		return (
			<li>
				<img src={like.profile_picture.uri}/>
				<h4><a href={like.uri} target="_blank">{like.name}</a></h4>
				<span> likes this.</span>
			</li>
		);
	}
});

/**
 *  Higher-Order Transmit component that will contain the above React component.
 */
export default Transmit.createContainer(Like, {
	/**
	 * Default query params.
	 */
	queryParams: {
		user: null
	},
	queries: {
		/**
		 * The "like" query maps a stargazer into a like.
		 */
		like (queryParams) {
			if (!queryParams.user) {
				throw new Error("queryParams.user required");
			}

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
