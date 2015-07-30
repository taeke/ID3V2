/*
 * Header for a frame.
 */

'use strict';

var constants = require('./constants.js');
var BaseHeader = require('./baseHeader.js');
var FrameHeaderValidator = require('./frameHeaderValidator.js');
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
 * Creates a TagHeaderValidator instance.
 * @params arguments[0] either a array of bytes containing the data for the frame header or the frameId for creating
 * a default frame header.
 * @constructor
 */
var FrameHeader = module.exports = function () {
    FrameHeader.super_.call(this);
    this._frameHeaderValidator = new FrameHeaderValidator();
    if (Array.isArray(arguments[0])) {
        this._createHeaderFromBytes(arguments[0]);
    } else {
        this._getDefault(arguments[0]);
    }
};

util.inherits(FrameHeader, BaseHeader);

/*
 * Every header exists as a specific amount of bytes in a id3v2 file. This function Creates the properties containing
 * the information based on the byte array.
 * @param bytes (array) The bytes containing valid ID3 header.
 */
FrameHeader.prototype._createHeaderFromBytes = function (bytes) {
    if (!this._frameHeaderValidator.containsHeaderBytes(bytes)) {
        throw(constants.messages.NOT_A_FRAME_HEADER);
    }

    var statusFlagByte = bytes[bytePositions.FLAGS_STATUS];
    var encodingFlagByte = bytes[bytePositions.FLAGS_ENDOCING];
    var firstFrameIdByte = bytes[bytePositions.FRAME_ID];
    var sizeEndPosition = bytePositions.SIZE + constants.values.SIZE_BYTES_LENGTH;
    this.frameId = new Buffer(bytes.slice(bytePositions.FRAME_ID, constants.values.FRAME_ID_LENGTH)).toString('ascii');
    this.size = this._nonSyncsafeArrayToSize(bytes.slice(bytePositions.SIZE, sizeEndPosition));
    this.tagAlterPreservationIsSet = (statusFlagByte & bitMasksFlags.TAG_ALTER_PRESERVATION) ? true : false;
    this.fileAlterPreservationIsSet = (statusFlagByte & bitMasksFlags.FILE_ALTER_PRESERVATION) ? true : false;
    this.readOnlyIsSet = (statusFlagByte & bitMasksFlags.READ_ONLY) ? true : false;
    this.compressionIsSet = (encodingFlagByte & bitMasksFlags.COMPRESSION) ? true : false;
    this.encryptionIsSet = (encodingFlagByte & bitMasksFlags.ENCRYPTION) ? true : false;
    this.groupingIdentityIsSet = (encodingFlagByte & bitMasksFlags.ENCRYPTION) ? true : false;
    this.frameType = this._getFrameType(firstFrameIdByte);
};

/*
 * Returns a default frame header with the provided frameId.
 * @param frameId {string} The
 * @returns { frameId: string,                    => The passed in frameId
 *           size: number,                        => default 0
 *           tagAlterPreservationIsSet: boolean,  => default false
 *           fileAlterPreservationIsSet: boolean, => default false
 *           readOnlyIsSet: boolean,              => default false
 *           compressionIsSet: boolean,           => default false
 *           encryptionIsSet: boolean,            => default false
 *           groupingIdentityIsSet: boolean,      => default false
 *           frameType: * }                       => Text when frameId starts with T otherwise OTHER
 */
FrameHeader.prototype._getDefault = function (frameId) {
    this.frameId = frameId;
    this.tagAlterPreservationIsSet = false;
    this.fileAlterPreservationIsSet = false;
    this.readOnlyIsSet = false;
    this.compressionIsSet = false;
    this.encryptionIsSet = false;
    this.groupingIdentityIsSet = false;
    this.frameType = this._getFrameType(frameId.charCodeAt(0));
    this.size = this.frameType === constants.enums.frameTypes.TEXT ? 5 : 0; // 5 = Encoding + BOM + NULL terminating.
};

/*
 * There are different kind of frames in a tag. The type of frame is determined by the first character of the Frame ID.
 * @param firstFrameIdByte The first byte of the Frame ID.
 * @returns {number} A enum value indicating the type of the frame.
 * @private
 */
FrameHeader.prototype._getFrameType = function (firstFrameIdByte) {
    if (firstFrameIdByte === 0x54) { // T
        return constants.enums.frameTypes.TEXT;
    }

    return constants.enums.frameTypes.OTHER;
};

