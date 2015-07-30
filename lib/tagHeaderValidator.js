
/*
 * Validator for validating if a array of bytes contains tag header data.
 */

'use strict';

var constants = require('./constants.js');
var BaseHeaderValidator = require('./baseHeaderValidator.js');
var util = require('util');

/*
 * Creates a TagHeaderValidator instance.
 * @constructor
 */
var TagHeaderValidator = module.exports = function() {
    TagHeaderValidator.super_.call(this, constants.values.TAG_HEADER_LENGTH);
    this._initializeByteValidators();
};

util.inherits(TagHeaderValidator, BaseHeaderValidator);

/*
 * Every header exists as a specific amount of bytes in a id3v2 file. This function checks if bytes array contains a
 * valid header.
 * @param bytes The byte array to check.
 * @param _start There is a performance penalty for moving the bytes in the array. That's why each byte is inserted in
 * the next spot. This parameter tells where the bytes starting position really is.
 * @returns {boolean} True if the byte array contains a valid header.
 */
TagHeaderValidator.prototype.containsHeaderBytes = function(bytes, start) {
    this._start = start;
    if (start >= constants.values.TAG_HEADER_LENGTH) {
        throw(constants.messages.START_NOT_WITHIN_ARRAY);
    }

    return this._containsHeaderBytes(bytes);
};

/*
 * There is a performance penalty for moving the bytes in the array. That's why each byte is inserted in the next spot.
 * This means the real position has to be calculated.
 * @param position The position if the _start was 0.
 * @param _start The start of the first byte in the array.
 * @returns {number} The real position.
 * @private
 */
TagHeaderValidator.prototype._calculatePosition = function (position, start) {
    var total = position + start;

    if (total < constants.values.TAG_HEADER_LENGTH) {
        return total;
    } else {
        return total - constants.values.TAG_HEADER_LENGTH;
    }
};

/*
 * Check if a specific byte in the array passes the validator test. Each byte in the array has values which are valid for
 * that specific byte. A validator checks if the byte has a valid value.
 * @param bytes The byte arry.
 * @param index The index of the byte to test. This is when the first byte in the array is at _start 0.
 * @returns {boolean} True if the byte passes the validator test.
 * @private
 */
TagHeaderValidator.prototype._checkByteValidator = function(bytes, index) {
    var validatePosition = this._calculatePosition(index, this._start);
    var validator = this._byteValidators[index];
    return validator(bytes[validatePosition]);
};

/*
 * Each byte in the array has values which are valid for that specific byte. This is the initialisation of the functions
 * which test these values.
 * @private
 */
TagHeaderValidator.prototype._initializeByteValidators = function() {
    var that = this;
    this._byteValidators = [
        function (byte) {
            return that._isOneOfTheBytes(byte, [0x49]);             // I
        },
        function (byte) {
            return that._isOneOfTheBytes(byte, [0x44]);             // D
        },
        function (byte) {
            return that._isOneOfTheBytes(byte, [0x33]);             // 3
        },
        function (byte) {
            return that._isOneOfTheBytes(byte, [0x02, 0x03, 0x04]); // Major version 2, 3 or 4
        },
        function (byte) {
            return that._isOneOfTheBytes(byte, [0x00]);             // Minor version 0
        },
        function (byte) {
            return that._bitsAreNotSet(byte, [0, 1, 2, 3]);         // Flags
        },
        function (byte) {
            return that._bitsAreNotSet(byte, [7]);                  // Size
        },
        function (byte) {
            return that._bitsAreNotSet(byte, [7]);                  // Size
        },
        function (byte) {
            return that._bitsAreNotSet(byte, [7]);                  // Size
        },
        function (byte) {
            return that._bitsAreNotSet(byte, [7]);                  // Size
        }
    ];
};
