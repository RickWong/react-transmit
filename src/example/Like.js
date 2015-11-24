import React from "react";
import InlineCss from "react-inline-css";
import Transmit from "lib/react-transmit";

/**
 * @class Like
 */
const Like = React.createClass({
	render () {
		/**
		 * This prop is guaranteed by Transmit.
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
 *  Higher-order component that will fetch data for the above React component.
 */
export default Transmit.createContainer(Like, {
	fragments: {
		/**
		 * The "like" fragment maps a GitHub user to a like.
		 */
		like ({stargazer}) {
			return Promise.resolve({
				name:            stargazer.login,
				uri:             stargazer.html_url,
				profile_picture: {
					uri: `${stargazer.avatar_url}&s=20`
				}
			});
		}
	}
});
