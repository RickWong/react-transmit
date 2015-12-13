import fetch from "isomorphic-fetch";
import {connectEndpoint} from "fetch-plus";
import jsonMiddleware from "fetch-plus-json";

/**
 * Return GitHub API client with built-in JSON support.
 */
export default connectEndpoint(
	"https://api.github.com", {}, [jsonMiddleware()]
);
