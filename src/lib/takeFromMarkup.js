/**
 * @copyright © 2015, Rick Wong. All rights reserved.
 */
"use strict";

var assign = require("./assign");

/**
 * @function takeFromMarkup
 */
module.exports = function () {
	var packet = {};

	if (typeof window !== "undefined" && window.__reactTransmitPacket) {
		assign(packet, window.__reactTransmitPacket || {});
		delete window.__reactTransmitPacket;
	}

	return packet;
};
