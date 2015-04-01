![](http://i.imgur.com/X3JE4Ev.png?1)

[View live demo](https://edealer.nl/react-transmit/) 

# React Transmit

Relay-inspired library based on Promises instead of GraphQL.

Inspired by: [Building the Facebook Newsfeed with Relay](http://facebook.github.io/react/blog/2015/03/19/building-the-facebook-news-feed-with-relay.html) (React blog)

## Features

- Official Relay-inspired API and syntax.
- Write declarative queries right in components as Promises.
- Isomorphic architecture supports server-side rendering.
- Works with React 0.12 and 0.13, and React Native!

## Installation

	npm install react-transmit
	# or
	npm install react-transmit-native

## Usage

````js
import React from "react";
import Transmit from "react-transmit";

const Newsfeed = React.createClass(...);

export default Transmit.createContainer(Newsfeed, {
	queryParams: {
		count: 10
	},
	queries: {
		stories (queryParams) {
			// All Transmit queries return a Promise.
			return Promise.all([
				Story.getQuery("story")
			]);
		}
	}
});
````

## Community

Let's start one together! After you ★Star this project, follow [@Rygu](https://twitter.com/rygu)
on Twitter.

## License

BSD 3-Clause license. Copyright © 2015, Rick Wong. All rights reserved.
