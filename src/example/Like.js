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
 *  Higher-order component that will do queries for the above React component.
 */
export default Transmit.createContainer(Like, {
	/**
	 * Default query params.
	 */
	initialVariables: {
		user: null
	},
	queries: {
		/**
		 * The "like" query maps a stargazer into a like.
		 */
		like (variables) {
			if (!variables.user) {
				throw new Error("variables.user required");
			}

			return Promise.resolve({
				name: variables.user.login,
				uri: variables.user.html_url,
				profile_picture: {
					uri: `${variables.user.avatar_url}&s=20`
				}
			});
		}
	}
});
