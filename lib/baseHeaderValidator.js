/*
 * There are two types of headers in an id3v2 tag. The tag header and the frame header. This is a common base for
 * validating if a array of bytes contains header data.
 */

'use strict';

var constants = require('./constants.js');

/*
 * Creates a BaseHeaderValidator instance.
 * @constructor
 */
var BaseHeaderValidator = module.exports = function (headerSize) {
    this._headerSize = headerSize;
    this._propertyValidators = [];
};

/*
 * Every header exists as a specific amount of bytes in a id3v2 file. This function checks if bytes array contains a
 * valid header. It is a base implementation and should be called from a public containsHeaderBytes in a subClass because it
 * uses the abstract _checkByteValidator which should be implemented in the subClass.
 * @param bytes The byte array to check.
 * @returns {boolean} True if the byte array contains a valid header.
 * @private
 */
BaseHeaderValidator.prototype._containsHeaderBytes = function (bytes) {
    if (bytes.length !== this._headerSize) {
        return false;
    }

    for (var i = 0; i < bytes.length; i++) {
        if (!this._checkByteValidator(bytes, i)) {
            return false;
        }
    }

    return true;
};

/* Check if a specific byte in the array passes the validator test. Each byte in the array has values which are valid
 * for that specific byte. A validator checks if the byte has a valid value. Abstract functions hould be implemented in
 * a subClass.
 * @param bytes The array of bytes.
 * @param index The index of the byte to check.
 * @private
 */
BaseHeaderValidator.prototype._checkByteValidator = function (bytes, index) {
    throw(constants.messages.DONT_CALL_ON_BASE_CLASS);
};

/*
 * Checks if certain bits in a byte are not set. The other bits can be set or not set.
 * @param byte The byte for which the bits should not be set.
 * @param bits A array containing the index of the bits which should not be set.
 * @returns {boolean} True if the bits ar not set.
 * @private
 */
BaseHeaderValidator.prototype._bitsAreNotSet = function (byte, bits) {
    for (var i = 0; i < bits.length; i++) {
        if (byte & constants.values.bitMasks[bits[i]]) {
            return false;
        }
    }

    return true;
};

/*
 * Checks if a byte's value is present in a array of bytes.
 * @param byte The byte to check.
 * @param bytes The valid values for the byte.
 * @returns {boolean} True if the value of the byte is in the bytes array.
 * @private
 */
BaseHeaderValidator.prototype._isOneOfTheBytes = function (byte, bytes) {
    return bytes.indexOf(byte) !== -1;
};