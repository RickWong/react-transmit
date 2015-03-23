import React from "react";
import InlineCss from "react-inline-css";
import Newsfeed from "example/Newsfeed";

/**
 * Nothing special happening in this file, really. See Newsfeed.js.
 *
 * @class Main
 */
export default React.createClass({
	statics: {
		/**
		 * Style this example app like Facebook.
		 */
		css: () => `
			body {
				background: #E9EAED;
				box-sizing: border-box;
				font-family: Helvetica, sans-serif;
			}
			& .github {
				position: absolute;
				top: 0;
				right: 0;
				border: 0;
			}
			& {
				width: 500px;
				margin: 10px auto;
			}
			& header {
				padding: 20px 30px;
				background: #fff;
				border: 1px solid #e1e1e1;
				border-radius: 3px 3px 0 0;
				font-size: 14px;
			}
			& header span, & header span a {
				color: #6d84b4;
				font-size: 13px;
			}
			& a {
				color: #3B5998;
				text-decoration: none;
			}
			& a:hover {
				text-decoration: underline;
			}`
	},
	render () {
		const repositoryUrl = "https://github.com/RickWong/react-transmit";

		return (
			<InlineCss stylesheet={this.constructor.css()} namespace="Main">
				<a className="github" href={repositoryUrl}>
					<img src="https://camo.githubusercontent.com/365986a132ccd6a44c23a9169022c0b5c890c387/68747470733a2f2f73332e616d617a6f6e6177732e636f6d2f6769746875622f726962626f6e732f666f726b6d655f72696768745f7265645f6161303030302e706e67" alt="Fork me on GitHub" />
				</a>
				<header>
					<h1>
						<a href={repositoryUrl}>React Transmit</a>
					</h1>
					<p>
						Relay-inspired library based on Promises instead of GraphQL.
					</p>
					<span>
						<a href={repositoryUrl + "/stargazers"}>Like</a><span> · </span>
						<a href={"https://twitter.com/intent/tweet?text=React%20Transmit:%20a%20Relay-inspired+library+based+on+Promises+instead+of+GraphQL.%20" + repositoryUrl + "%20@rygu%20@reactjs"} target="_blank">Share</a>
					</span>
				</header>
				<Newsfeed repositoryUrl={repositoryUrl} />
			</InlineCss>
		);
	}
});
