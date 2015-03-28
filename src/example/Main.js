import React from "react";
import InlineCss from "react-inline-css";
import Transmit from "lib/react-transmit";
import Newsfeed from "example/Newsfeed";

/**
 * @class Main
 */
const Main = React.createClass({
	statics: {
		/**
		 * Style this example app like Facebook.
		 */
		css: () => `
			* {
				box-sizing: border-box;
			}
			body {
				background: #E9EAED;
				font-family: Helvetica, sans-serif;
			}
			a {
				color: #3B5998;
				text-decoration: none;
			}
			a:hover {
				text-decoration: underline;
			}
			& .github {
				position: fixed;
				top: 0;
				right: 0;
				border: 0;
			}`
	},
	onQueryComplete (error, queryResults) {
		if (error) {
			throw error;
		}

		console.log("Main.onQueryComplete: ", queryResults);
	},
	render () {
		const repositoryUrl = "https://github.com/RickWong/react-transmit";

		/**
		 * This is a Transmit prop.
		 */
		const {stories} = this.props;

		/**
		 * This is an optional callback to capture the query results.
		 */
		const {onQueryComplete} = this;

		return (
			<InlineCss stylesheet={Main.css()} namespace="Main">
				<a className="github" href={repositoryUrl}>
					<img src="https://camo.githubusercontent.com/365986a132ccd6a44c23a9169022c0b5c890c387/68747470733a2f2f73332e616d617a6f6e6177732e636f6d2f6769746875622f726962626f6e732f666f726b6d655f72696768745f7265645f6161303030302e706e67" alt="Fork me on GitHub"/>
				</a>
				<Newsfeed {...{repositoryUrl, stories, onQueryComplete}} />
			</InlineCss>
		);
	}
});

export default Transmit.createContainer(Main, {
	queries: {
		stories (queryParams) {
			return Newsfeed.getQuery("stories")
		}
	}
});
