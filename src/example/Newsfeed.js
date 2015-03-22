import React from "react";
import InlineCss from "react-inline-css";
import Transmit from "lib/react-transmit";
import Story from "example/Story";

/**
 * @class Newsfeed
 */
const Newsfeed = React.createClass({
	statics: {
		css: (avatarSize) => `
			body {
				background: #E9EAED;
			}
			& .github {
				position: absolute;
				top: 0;
				right: 0;
				border: 0;
			}
			& {
				font-family: Helvetica, sans-serif;
				width: 500px;
				margin: 20px auto;
				font-size: 14px;
			}
			& header {
				padding: 20px 30px;
				background: #fff;
				border: 1px solid #e5e5e5;
				border-radius: 3px;
				margin-bottom: 10px;
			}
			& header h2 {
				color: #3B5998;
			}
			& footer {
				text-align: center;
				margin: 12px;
			}`
	},
	onLoadMore (event) {
		event.preventDefault();
		this.props.setQueryParams({count: this.props.queryParams.count + 1});
	},
	render () {
		const repositoryUrl = "https://github.com/RickWong/react-transmit";
		const stories = this.props.stories || [];

		return (
			<InlineCss stylesheet={Newsfeed.css()} namespace="Newsfeed">
				<a className="github" href={repositoryUrl}>
					<img src="https://camo.githubusercontent.com/365986a132ccd6a44c23a9169022c0b5c890c387/68747470733a2f2f73332e616d617a6f6e6177732e636f6d2f6769746875622f726962626f6e732f666f726b6d655f72696768745f7265645f6161303030302e706e67" alt="Fork me on GitHub" />
				</a>
				<header>
					<h2>
						React Transmit
					</h2>
					<p>
						A promising Relay-ish library without the GraphQL.
					</p>
				</header>
				<main>
					{stories.map((story, i) => <Story key={i} />)}
				</main>
				<footer>
					<a href="#" onClick={this.onLoadMore}>
						Load more
					</a>
				</footer>
			</InlineCss>
		);
	}
});

export default Transmit.createContainer(Newsfeed, {
	queryParams: {
		count: 1
	},
	queries: {
		stories (queryParams) {
			return new Promise(function (resolve, reject) {
				var storyPromises = [];

				for (var i=0; i<queryParams.count; i++) {
					storyPromises.push(Story.getQuery("story"));
				}

				Promise.all(storyPromises).then(resolve);
			});
		}
	}
});
