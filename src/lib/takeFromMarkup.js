/**
 * @copyright © 2015, Rick Wong. All rights reserved.
 */
"use strict";

/**
 * @function takeFromMarkup
 */
module.exports = function () {
	var packet = [];

	if (typeof window !== "undefined" && window.__reactTransmitPacket) {
		packet = (window.__reactTransmitPacket || []).slice(0);
		delete window.__reactTransmitPacket;
	}

	return packet;
};
