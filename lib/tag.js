/*
 * The ID3v2 tag.
 * http://id3.org/id3v2.4.0-structure 3. ID3v2 overview
 * http://id3.org/d3v2.3.0            3. ID3v2 overview
 * http://id3.org/id3v2-00            3. ID3v2 overview
 */

'use strict';

var constants = require('./constants');
var Frame = require('./frame');
var FrameHeader = require('./frameHeader');
var FrameHeaderValidator = require('./frameHeaderValidator');

var textFrameIds = ['TALB', 'TBPM', 'TCOM', 'TCON', 'TCOP', 'TDAT', 'TDLY', 'TENC', 'TEXT', 'TFLT', 'TIME', 'TIT1', 'TIT2', 'TIT3', 'TKEY', 'TLAN', 'TLEN', 'TMED', 'TOAL', 'TOFN', 'TOLY', 'TOPE', 'TORY', 'TOWN', 'TPE1', 'TPE2', 'TPE3', 'TPE4', 'TPOS', 'TPUB', 'TRCK', 'TRDA', 'TRSN', 'TRSO', 'TSIZ', 'TSRC', 'TSSE', 'TYER'];

/*
 * Creates a Tag instance.
 * @constructor
 */
var Tag = module.exports = function (tagHeader) {
    this._frames = [];
    this._count = 0;
    this._frameHeaderBytes = [];
    this._frameHeaderValidator = new FrameHeaderValidator();
    this.header = tagHeader;
    this.state = constants.enums.tagStates.CREATING_FRAME_HEADER;
    this._initializeTextFrames();
};

/*
 * We want all declared texframes to be available on the tag by their frameId as property name even if a frame with a
 * specific frameId is not available in the original stream.
 */
Tag.prototype._initializeTextFrames = function () {
    var that = this;
    textFrameIds.forEach(function (frameId) {
        Object.defineProperty(that, frameId, {
            get: function () {
                return this.getFrame(frameId).getText()
            }
        });
    });
};

/*
 * Every tag exists as a amount of bytes in a id3v2 file. We convert these bytes to a tag object by adding byte for
 * byte until the tag is complete. These bytes are the bytes excluding the header. The header is a argument in the
 * constructor.
 * @param byte The next byte.
 */
Tag.prototype.addByte = function (byte) {
    switch (this.state) {
        case constants.enums.tagStates.CREATING_FRAME_HEADER:
            this._addByteToFrameHeader(byte);
            break;
        case constants.enums.tagStates.ADDING_FRAME_BYTES:
            this._addByteToFrame(byte);
            break;
        case constants.enums.tagStates.PADDING:
            this._padding(byte);
            break;
        case constants.enums.tagStates.COMPLETE:
            throw(constants.messages.BYTE_ADDED_AFTER_COMPLETE);
    }

    this._incrementCount();
};

/*
 * Return the frame with frameId or a default frame if the frameId is not found;
 * @param frameId
 * @retuns The frame indicated by the frameId.
 */
Tag.prototype.getFrame = function (frameId) {
    var result;
    this._frames.forEach(function (frame) {
        if (frame.header.frameId === frameId) {
            result = frame;
        }
    });

    if (!result) {
        result = Frame._getDefaultFrame(frameId)
    }

    return result;
};

/*
 * Check if the last frame does not contain any information we don't have an implementation for yet.
 * @private
 */
Tag.prototype._checkImplementation = function (frame) {
    if (!this._isFrameIdUnique(frame.frameId)) {
        throw(constants.messages.NOT_IMPLEMENTED);
    }

    if (frame.header &&
        frame.header.frameType === constants.enums.frameTypes.TEXT &&
        (frame.compressionIsSet || frame.encryptionIsSet)) {
        throw(constants.messages.NOT_IMPLEMENTED);
    }
};

/*
 * Check if there is not a frame with the same frameId already in the list of frames.
 * @param frameId string The frameId to check.
 * @returns boolean True if the frameId is NOT found in the already the list of frames.
 * @private
 */
Tag.prototype._isFrameIdUnique = function (frameId) {
    var result = true;
    this._frames.forEach(function (frame) {
        if (frame.frameId === frameId) {
            result = false;
        }
    });

    return result;
};

/*
 * Increment _count and set state to COMPLETE if all bytes are added.
 * @private
 */
Tag.prototype._incrementCount = function () {
    this._count++;
    if (this._count === this.header.size) {
        this._changeState(constants.enums.tagStates.COMPLETE);
    }
};

/*
 * Add a byte to the byte array for the current header. If a complete header is found create a new frame. If a new frame
 * is created change the state to ADDING_FRAME_BYTES unless the size = 0;
 * @param byte The byte to add.
 * @private
 */
Tag.prototype._addByteToFrameHeader = function (byte) {
    if (byte === 0x00 && this._frameHeaderBytes.length === 0) {
        this._changeState(constants.enums.tagStates.PADDING);
    } else {
        this._frameHeaderBytes.push(byte);
        if (this._frameHeaderBytes.length === constants.values.FRAME_HEADER_LENGTH) {
            var header = new FrameHeader(this._frameHeaderBytes);
            var frame = new Frame(header);
            frame.isInSourceStream = true;
            this._frameHeaderBytes = [];
            this._checkImplementation(frame);
            this._frames.push(frame);
            if (frame.header.size !== 0) {
                this.state = constants.enums.tagStates.ADDING_FRAME_BYTES;
            }
        }
    }
};

/*
 * Add a byte to the current frame. If the current frame is complete create a new frame first unless byte is 0 then we
 * change te state to PADDING and don't add the byte;
 * @param byte the byte to add.
 * @private
 */
Tag.prototype._addByteToFrame = function (byte) {
    if (this._frames.length === 0) {
        throw(constants.messages.NO_FRAMES_FOUND);
    }

    this._frames[this._frames.length - 1].addByte(byte);
    if (this._lastFrameState() === constants.enums.frameStates.COMPLETE) {
        this._changeState(constants.enums.tagStates.CREATING_FRAME_HEADER)
    }
};

/*
 * Check if the bytes for the padding are all 0.
 * @param byte The byte to check.
 * @private
 */
Tag.prototype._padding = function (byte) {
    if (byte !== 0x00) {
        throw(constants.messages.PADDING_ONLY_WITH_0);
    }
};

/*
 * Helper for returning the state of the current (last) frame.
 * @returns {*} The last frame.
 * @private
 */
Tag.prototype._lastFrameState = function () {
    if (this._frames.length === 0) {
        return constants.enums.frameStates.NO_FRAME_FOUND;
    }

    return this._frames[this._frames.length - 1].state;
};

/*
 * Helper for changing state. Throws an exception if the change is not valid.
 * @param newState The state to change to.
 * @private
 */
Tag.prototype._changeState = function (newState) {
    var doneWithLastFrame = this._lastFrameState() === constants.enums.frameStates.COMPLETE;
    doneWithLastFrame = doneWithLastFrame || this._lastFrameState() === constants.enums.frameStates.NO_FRAME_FOUND;

    if (!doneWithLastFrame && newState === constants.enums.tagStates.COMPLETE) {
        throw(constants.messages.FRAME_MUST_BE_COMPLETE);
    }

    if (!doneWithLastFrame && newState === constants.enums.tagStates.PADDING) {
        throw(constants.messages.FRAME_MUST_BE_COMPLETE);
    }

    this.state = newState;
};