import fetch from "isomorphic-fetch";
import {connectEndpoint} from "fetch-rest";
import jsonMiddleware from "fetch-rest-json";

/**
 * Return GitHub API client with built-in JSON support.
 */
export default connectEndpoint(
	"https://api.github.com", {}, [jsonMiddleware()]
);
