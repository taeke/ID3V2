/*
 * There are two types of headers in an id3v2 tag. The tag header and the frame header. This is a common base for
 * both.
 */

'use strict';

var constants = require('./constants.js');

/*
 * Creates a BaseHeader instance.
 * @constructor
 */
var BaseHeader = module.exports = function () {
};

/*
 * Turns a array of bytes into a integer.
 * @param bytes The array of bytes containing the integer.
 * @returns {number} The integer.
 * @private
 */
BaseHeader.prototype._byteArrayToInteger = function (bytes) {
    var input = 0;
    for (var i = 0; i < constants.values.SIZE_BYTES_LENGTH; i++) {
        input = input + bytes[constants.values.SIZE_BYTES_LENGTH - 1 - i] * Math.pow(256, i);
    }

    return input;
};

/*
 * Turns an array of bytes into the size property. The array must have the syncsafe integer version of the size in it.
 * @param bytes. The byte array containing the size.
 * @returns {number} The size as a number.
 * @private
 */
BaseHeader.prototype._syncsafeArrayToSize = function (bytes) {
    var input = this._byteArrayToInteger(bytes);
    var out = 0;
    var mask = 0x7F000000;

    while (mask) {
        out >>= 1;
        out |= input & mask;
        mask >>= 8;
    }

    return out;
};

/*
 * Turns an array of bytes into the size property. The array must have the NONsyncsafe integer version of the size in it.
 * @param bytes. The byte array containing the size.
 * @returns {number} The size as a number.
 * @private
 */
BaseHeader.prototype._nonSyncsafeArrayToSize = function (bytes) {
    return this._byteArrayToInteger(bytes);
};