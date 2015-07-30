/*
 * Header for a tag.
 */

'use strict';

var constants = require('./constants.js');
var BaseHeader = require('./baseHeader.js');
var TagHeaderValidator = require('./tagHeaderValidator.js');
var util = require('util');

var bytePositions = {
    MAJOR_VERSION: 3,
    FLAGS: 5,
    SIZE: 6
};

var bitMasksFlags = {
    UNSYNCHRONISATION: constants.values.bitMasks[7],
    EXTENDED_HEADER: constants.values.bitMasks[6],
    EXPERIMENTAL_INDICATOR: constants.values.bitMasks[5],
    FOOTER_PRESENT: constants.values.bitMasks[4]
};

/*
 * Creates a TagHeaderValidator instance.
 * @constructor
 */
var TagHeader = module.exports = function (bytes, start) {
    TagHeader.super_.call(this);
    this.tagHeaderValidator = new TagHeaderValidator();
    if (bytes && start !== undefined) {
        this._createHeaderFromBytes(bytes, start);
    }
};

util.inherits(TagHeader, BaseHeader);

/*
 * Every header exists as a specific amount of bytes in a id3v2 file. This function Creates the properties containing
 * the information based on the byte array.
 * @param bytes (array) containing the valid ID3 header.
 * @param start (number) the starting position of the array.
 */
TagHeader.prototype._createHeaderFromBytes = function (bytes, start) {
    if (!this.tagHeaderValidator.containsHeaderBytes(bytes, start)) {
        throw(constants.messages.NOT_A_TAG_HEADER);
    }

    var orderBytes = this._orderBytes(bytes, start);
    this.version = orderBytes[bytePositions.MAJOR_VERSION];
    var flagByte = orderBytes[bytePositions.FLAGS];
    this.unsynchronisationIsSet = (flagByte & bitMasksFlags.UNSYNCHRONISATION) ? true : false;
    this.extendedHeaderIsSet = (flagByte & bitMasksFlags.EXTENDED_HEADER) ? true : false;
    this.experimentalIndicatorIsSet = (flagByte & bitMasksFlags.EXPERIMENTAL_INDICATOR) ? true : false;
    this.footerPresentIsSet = (flagByte & bitMasksFlags.FOOTER_PRESENT) ? true : false;
    var sizeEndPosition = bytePositions.SIZE + constants.values.SIZE_BYTES_LENGTH;
    this.size = this._syncsafeArrayToSize(orderBytes.slice(bytePositions.SIZE, sizeEndPosition));
};

/*
 * The array of bytes can have it's startposition on any byte. Here we order the bytes so it starts at 0.
 * @param bytes (array) containing the valid ID3 header.
 * @param start (number) the starting position of the array.
 * @returns {array} The bytes with the start position on 0.
 * @private
 */
TagHeader.prototype._orderBytes = function (bytes, start) {
    return bytes.slice(start).concat(bytes.slice(0, start));
};
