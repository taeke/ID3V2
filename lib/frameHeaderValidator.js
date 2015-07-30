/*
 * Validator for validating if a array of bytes contains frame header data.
 */

'use strict';

var constants = require('./constants.js');
var BaseHeaderValidator = require('./baseHeaderValidator.js');
var util = require('util');

var bytePositions = {
    FRAME_ID: 0,
    SIZE: 4,
    FLAGS_STATUS: 8,
    FLAGS_ENDOCING: 9
};

var bitMasksFlags = {
    TAG_ALTER_PRESERVATION: constants.values.bitMasks[7],
    FILE_ALTER_PRESERVATION: constants.values.bitMasks[6],
    READ_ONLY: constants.values.bitMasks[5],
    COMPRESSION: constants.values.bitMasks[7],
    ENCRYPTION: constants.values.bitMasks[6],
    GROUPING_IDENTITY: constants.values.bitMasks[5]
};

/*
 * Creates a FrameHeaderValidator instance.
 * @constructor
 */
var FrameHeaderValidator = module.exports = function () {
    FrameHeaderValidator.super_.call(this, constants.values.TAG_HEADER_LENGTH);
    this._initializeByteValidators();
    this._validFrameIdBytes = this._createByteRange(0x41, 0x5A).concat(this._createByteRange(0x30, 0x39));
};

util.inherits(FrameHeaderValidator, BaseHeaderValidator);

/*
 * Every header exists as a specific amount of bytes in a id3v2 file. This function checks if bytes array contains a
 * valid header.
 * @param bytes The byte array to check.
 * @returns {boolean} True if the byte array contains a valid header.
 */
FrameHeaderValidator.prototype.containsHeaderBytes = function (bytes) {
    return this._containsHeaderBytes(bytes);
};

//http://www.2ality.com/2013/11/initializing-arrays.html
/*
 * Creates a range of bytes in een array starting from startByte incremented by 1 till endByte.
 * @param startByte The lowest value of bytes in the range.
 * @param endByte The highest value of bytes in the range.
 * @returns {Array} A array filled with bytes from startByte to endByte incremented by 1.
 * @private
 */
FrameHeaderValidator.prototype._createByteRange = function (startByte, endByte) {
    var arr = Array.apply(null, new Array(endByte - startByte + 1));
    return arr.map(function (byte, index) {
        return index + startByte
    });
};

/*
 * Check if a specific byte in the array passes the validator test. Each byte in the array has values which are valid
 * for that specific byte. A validator checks if the byte has a valid value.
 * @param bytes The byte arry.
 * @param index The index of the byte to test.
 * @returns {boolean} true if the byte passes the validator test.
 * @private
 */
FrameHeaderValidator.prototype._checkByteValidator = function (bytes, index) {
    var validator = this._byteValidators[index];
    return validator(bytes[index]);
};

/*
 * Each byte in the array has values which are valid for that specific byte. This is the initialisation of the functions
 * which test these values.
 * @private
 */
FrameHeaderValidator.prototype._initializeByteValidators = function () {
    var that = this;
    this._byteValidators = [
        function (byte) {
            return that._isOneOfTheBytes(byte, that._validFrameIdBytes); // A - Z en 0 - 9
        },
        function (byte) {
            return that._isOneOfTheBytes(byte, that._validFrameIdBytes); // A - Z en 0 - 9
        },
        function (byte) {
            return that._isOneOfTheBytes(byte, that._validFrameIdBytes); // A - Z en 0 - 9
        },
        function (byte) {
            return that._isOneOfTheBytes(byte, that._validFrameIdBytes); // A - Z en 0 - 9
        },
        function (byte) {
            return true;                                           // Size
        },
        function (byte) {
            return true;                                           // Size
        },
        function (byte) {
            return true;                                           // Size
        },
        function (byte) {
            return true;                                           // Size
        },
        function (byte) {
            return that._bitsAreNotSet(byte, [0, 1, 2, 3, 4]);     // Flags
        },
        function (byte) {
            return that._bitsAreNotSet(byte, [0, 1, 2, 3, 4]);     // Flags
        }
    ];
};