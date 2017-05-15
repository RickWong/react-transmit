/**
 * NOTE: This file is copied from `react-async`. Thanks Andrey Popp!
 *
 * @see https://github.com/andreypopp/react-async
 */
"use strict";

var asciiJSON = require('ascii-json');

/**
 * Inject data and optional client scripts into markup.
 *
 * @param {String} markup
 * @param {Object} data
 * @param {?Array} scripts
 * @param {?String} insertAfterClosingTag
 */
function injectIntoMarkup(markup, data, scripts, insertAfterClosingTag = 'body') {
	var escapedJson = asciiJSON.stringify(data).replace(/<\//g, '<\\/');
	var injected = '<script>window.__reactTransmitPacket=' + escapedJson + '</script>';
	var closingTag = '</' + insertAfterClosingTag + '>'

	if (scripts) {
		injected += scripts.map(function(script) {
			return '<script src="' + script + '"></script>';
		}).join('');
	}

	if (markup.indexOf(closingTag) > -1) {
		return markup.replace(closingTag, injected + '$&');
	} else {
		return markup + injected;
	}
}

module.exports = injectIntoMarkup;
