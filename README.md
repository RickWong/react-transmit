![](http://i.imgur.com/X3JE4Ev.png?1)

[View live demo](https://edealer.nl/react-transmit/) 

# React Transmit

[Relay](https://facebook.github.io/relay/)-inspired library based on Promises instead of GraphQL.

Inspired by: [Building the Facebook Newsfeed with Relay](http://facebook.github.io/react/blog/2015/03/19/building-the-facebook-news-feed-with-relay.html) (React blog)

![version](https://img.shields.io/npm/v/react-transmit.svg) ![license](https://img.shields.io/npm/l/react-transmit.svg) [![Package Quality](http://npm.packagequality.com/shield/react-transmit.svg)](http://packagequality.com/#?package=react-transmit) ![npm installs](https://img.shields.io/npm/dt/react-transmit.svg) ![downloads](https://img.shields.io/github/downloads/RickWong/react-transmit/latest/total.svg)


## Features

- API similar to the official Relay API, adapted for Promises.
- Higher-order Component (HoC) syntax is great for functional-style React.
- Composable Promise-based queries using fragments.
- Isomorphic architecture supports server-side rendering.
- Also works with React Native!

## Installation

```bash
	npm install react-transmit
```

## Usage

**Newsfeed.js** (read the comments)

````js
import React    from "react";
import Transmit from "react-transmit";  // Import Transmit.
import Story    from "./Story";

const Newsfeed = React.createClass({
	render () {
		const {stories} = this.props;  // Fragments are guaranteed.

		return <div>{stories.map(story => <Story story={story} />)}</div>;
	}
});

// Higher-order component that will fetch data for the above React component.
export default Transmit.createContainer(Newsfeed, {
	initialVariables: {
		count: 10  // Default variable.
	},
	fragments: {
		// Fragment names become the Transmit prop names.
		stories ({count}) {
			// This "stories" query returns a Promise composed of 3 other Promises.
			return Promise.all([
				Story.getFragment("story", {storyId: 1}),
				Story.getFragment("story", {storyId: 2}),
				Story.getFragment("story", {storyId: 3})
			]);
		},
		somethingDeferred () {
			// Return the promise wrapped in a function to mark this fragment as non-critical.
			return () => Promise.resolve(true);
		}
	}
});
````
**Story.js** (read the comments)

````js
import React    from "react";
import Transmit from "react-transmit";  // Import Transmit.

const Story = React.createClass({
	render () {
		const {story} = this.props; // Fragments are guaranteed.
		
		return <p>{story.content}</p>;
	}
});

export default Transmit.createContainer(Story, {
	fragments: {
		// This "story" fragment returns a Fetch API promise.
		story ({storyId}) {
			return fetch("https://some.api/stories/" + storyId).then(res => res.json());
		}
	}
});
````

## Documentation

See [DOCS.md](https://github.com/RickWong/react-transmit/blob/master/DOCS.md)

## Community

Let's start one together! After you ★Star this project, follow me [@Rygu](https://twitter.com/rygu)
on Twitter.

## License

BSD 3-Clause license. Copyright © 2015, Rick Wong. All rights reserved.
