/*
 * A ID3v2 frame which is a part of the ID3v2 tag.
 * http://id3.org/id3v2.4.0-structure 4. ID3v2 frames overview
 * http://id3.org/d3v2.3.0            4. Declared ID3v2 frames
 * http://id3.org/id3v2-00            4. Declared ID3v2 frames
 */

'use strict';

var constants = require('./constants');
var FrameHeader = require('./frameHeader');
var FrameHeaderValidator = require('../lib/frameHeaderValidator');
var iconv = require('iconv-lite');

/*
 * Creates a Frame instance.
 * @constructor
 */
var Frame = module.exports = function (header) {
    this.header = header;
    this.isInSourceStream = false;
    this._count = 0;
    if (header.size === 0) {
        this.state = constants.enums.frameStates.COMPLETE
    } else {
        this.state = constants.enums.frameStates.ADDING_DATA;
    }

    this.data = new Buffer(this.header.size);
};

Frame.textFrameEncodings = {0x00: 'iso-8859-1', 0x01: 'UTF-16'};

/*
 * Return a default frame. When the frameId indicates it is a Text frame it adds an encoding byte and empty string.
 * @param frameId (string) A frame must at least have a specific frameId.
 * @returns A default frame.
 * @private
 */
Frame._getDefaultFrame = function (frameId) {
    var result = new Frame(new FrameHeader(frameId));
    if (result.header.frameType === constants.enums.frameTypes.TEXT) {
        result.addByte(0x01);  // Unicode Encoding
        result.addByte(0xFF);  // BOM 1ste bye;
        result.addByte(0xFE);  // BOM;
        result.addByte(0x00);  // NULL terminated;
        result.addByte(0x00);  // NULL terminated Unicode;
    }

    return result;
};

/*
 * Every frame exists as a amount of bytes in a id3v2 file. We convert these bytes to a frame object by adding byte for
 * byte until the frame is complete.
 * @param byte The next byte.
 */
Frame.prototype.addByte = function (byte) {
    if (this.state === constants.enums.frameStates.COMPLETE) {
        throw(constants.messages.BYTE_ADDED_AFTER_COMPLETE);
    }

    this._count++;
    this.data.writeUInt8(byte, this._count - 1);
    this._setEncoding(byte);
    if (this._count === this.header.size) {
        this.state = constants.enums.frameStates.COMPLETE;
    }
};

/* Returns de decoded data as string when it is a TEXT frame.
 * @returns {string} the decoded data.
 */
Frame.prototype.getText = function () {
    if (this.header.frameType !== constants.enums.frameTypes.TEXT) {
        throw(constants.messages.ONLY_ON_TEXT_FRAMES)
    }

    if (this.state !== constants.enums.frameStates.COMPLETE) {
        throw(constants.messages.ONLY_ON_COMPLETE_FRAMES);
    }

    return iconv.decode(this.data.slice(1), this.textFrameEncoding);
};

/*
 * Set the textFrameEncoding if this is the encoding byte.
 * @param byte The next byte.
 * @private
 */
Frame.prototype._setEncoding = function (byte) {
    if (this.header.frameType === constants.enums.frameTypes.TEXT && this._count === 1) {
        this.textFrameEncoding = Frame.textFrameEncodings[byte];
        if(!this.textFrameEncoding) {
            throw(constants.messages.UNKNOWN_ENCODING);
        }
    }
};