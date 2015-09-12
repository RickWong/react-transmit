## API: `Transmit`

Transmit API is available from the `react-transmit` or `react-transmit-native` package:

````js
import Transmit from "react-transmit";  // ES6 imports are awseome!

var Transmit = require("react-transmit");  // Still using require() aye?
````

### Methods

The methods are named after their React / Relay counterparts. Their functionality is mostly the same, but their arguments and/or return types might differ slightly.

#### `createContainer(ReactClass, options) : ReactClass`

* Creates a container that wraps the original ReactClass.
* The container performs queries and passes query results as props to the original ReactClass.
* Possible `options` are the `initialVariables` and the `queries` definitions.
* [Example usage](https://github.com/RickWong/react-transmit/blob/c0266b061a2cfa7030500b932f3a88bf195e4465/src/example/Newsfeed.js#L50-L73)

#### `render(ReactClass, optionalProps, targetDOMNode, completeCallback) : void`

* For isomorphic apps, client-side.
* Use it instead of `React.render()` when you're using Transmit's `renderToString()` on the server-side.
* [Example usage](https://github.com/RickWong/react-isomorphic-starterkit/blob/2bf29c747770e79de06e130af325e0bdfb216bc9/src/client.js#L10)

#### `renderToString(ReactClass [, optionalProps]) : Promise`

* For isomorphic apps, server-side.
* Use it on the server to render your React component tree and capture the Transmit query results.
* Returns a Promise to a the rendered React-string and the captured query results.
* Tip: catch errors by defining a `.catch()` handler on the returned Promise.
* [Example usage](https://github.com/RickWong/react-isomorphic-starterkit/blob/2bf29c747770e79de06e130af325e0bdfb216bc9/src/server.js#L34-L52)

#### `injectIntoMarkup(html, data, scripts) : string`

* For isomorphic apps, server-side.
* If you captured query results on the server with Transmit's `renderToString()` then you can inject that data into the final markup that's sent to the client. Doing this allows Transmit's `render()` on the client to re-use the data.
* This method is actually copied from [react-async](https://github.com/andreypopp/react-async). Thanks [@andreypopp](https://github.com/andreypopp)!
* [Example usage](https://github.com/RickWong/react-isomorphic-starterkit/blob/2bf29c747770e79de06e130af325e0bdfb216bc9/src/server.js#L52)

#### `setPromiseConstructor(PromiseConstructor) : void`

* Optional. Provide your preferred Promise implementation instead of using `global.Promise` by default.

## API: `Transmit.Container` (Higher-order component)

Transmit's `createContainer()` method describes a new React component, a so-called Higher-order component that wraps the original ReactClass. Like any React component you can pass props to it. Below are the Transmit-specific props. Your own props are just passed onto the original ReactClass.

### PropTypes / specifiable props

#### `onQuery(Promise) : function`

* Optional. Pass this callback function to accept a Promise to the query results.
* Don't use this to call `setState()`. That's not necessary. Only use it for caching or logging the query results.
* Tip: catch errors by defining a `.catch()` handler on the accepted Promise.
* [Example usage](https://github.com/RickWong/react-transmit/blob/c0266b061a2cfa7030500b932f3a88bf195e4465/src/example/Main.js#L16)

#### `variables : object`

* Optional.
* Overwrites the default `initialVariables` defined with `createContainer()`.

#### `emptyView : ReactElement`

* Optional. The container will render this while the queries are not yet resolved.
* Defaults to `null` (React) or `<View />` (React Native).

### Static Methods

#### `getFragment(fragmentName [, variables]) : Promise`

* Retrieve a single fragment and returns a Promise.
* This is useful to compose a parent query that resolves child components' fragments.
* [Example usage](https://github.com/RickWong/react-transmit/blob/master/src/example/Newsfeed.js#L65-L69)


## API: Original ReactClass' `this.props`

Transmit exposes a complemental API to the contained ReactClass via its `this.props` in the same way Relay does. Don't worry, your own props are also accessible via `this.props`.

### Transmit props

#### `<queryName> : <queryResult>`

* For each declared query the original ReactClass will receive the query result from the container as a prop named exactly like the query.
* The query results are simply the values resolved from the query's Promise.
* [Example usage](https://github.com/RickWong/react-transmit/blob/c0266b061a2cfa7030500b932f3a88bf195e4465/src/example/Newsfeed.js#L14)

#### `transmit.variables : object`

* Currently used variables, read-only.
* You can use mutate these values to by calling `this.props.transmit.forceFetch()` that will also re-perform the queries.
* [Example usage](https://github.com/RickWong/react-transmit/blob/c0266b061a2cfa7030500b932f3a88bf195e4465/src/example/Newsfeed.js#L37)

### Methods

#### `transmit.forceFetch(variables [, queryName|queryNames]) : Promise`

 * Call this method to perform all queries again with the new `variables`.
 * Optionally specify a string or string-array to only re-perform a specific query/queries.
 * Returns a Promise to the query results. The same Promise that's passed to `onQuery()`.
 * Tip: catch errors by defining a `.catch()` handler on the returned Promise.
 * [Example usage](https://github.com/RickWong/react-transmit/blob/c0266b061a2cfa7030500b932f3a88bf195e4465/src/example/Newsfeed.js#L35-L43)
