![](http://i.imgur.com/wZNNrl4.png?1)

# React Transmit

A Promising Relay-ish library without the GraphQL.

Inspired by: http://facebook.github.io/react/blog/2015/03/19/building-the-facebook-news-feed-with-relay.html

## Installation

	npm install react-transmit

## Usage

TODO.

````js
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
````

## Community

Let's start one together! After you ★Star this project, follow [@Rygu](https://twitter.com/rygu)
on Twitter.

## License

BSD 3-Clause license. Copyright © 2015, Rick Wong. All rights reserved.
