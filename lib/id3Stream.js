/*
 * Write stream which emits a tagFound event if a valid tag is found in the stream. The event will have the tag as a
 * argument.
 */

'use strict';

var stream = require('stream');
var util = require('util');
var TagHeaderValidator = require('./tagHeaderValidator.js');
var TagHeader = require('./tagHeader');
var Tag = require('./tag.js');
var constants = require('./constants.js');

/*
 * Creates a Id3Stream instance.
 * @constructor
 */
var Id3Stream = module.exports = function () {
    Id3Stream.super_.call(this);
    this._headerData = [];
    this._start = 0;
    this._headerTagValidator = new TagHeaderValidator();
    this._tags = [];
};

util.inherits(Id3Stream, stream.Writable);

/**
 * See https://nodejs.org/api/stream.html#stream_writable_write_chunk_encoding_callback_1
 * A stream will contain tags and audio data. This stream is processed byte by byte and every byte can potentially be
 * the byte making a valid header so we check this. Once the header is found every byte can potentially be the byte
 * making a complete tag so we check this. Once the tag is complete we start looking for the next header once again.
 * @param chunk is a part of the stream.
 * @param encoding can be ignored in our case.
 * @param done must be called to signal we are finished processing the chunk.
 * @private
 */
Id3Stream.prototype._write = function (chunk, encoding, done) {
    for (var i = 0; i < chunk.length; i++) {
        this._checkTag(chunk[i]);
        this._checkHeader(chunk[i]);
    }

    done();
};

/*
 * Checks if adding this byte completes a tag. If everything goes well there should be only one tag at a time in the
 * stream. But if we get a false positive on a tagHeader we don't want to miss a real one. So for every found tagheader
 * a tag is created.
 * @param byte the byte to add.
 * @private
 */
Id3Stream.prototype._checkTag = function (byte) {
    for (var i = this._tags.length - 1; i >= 0; i--) {
        var tag = this._tags[i];
        try {
            tag.addByte(byte);
        }
        catch(e) {
            // Possible false positive on a tag header or a broken tag.
            this.emit(constants.events.TAG_ERROR, e);
            this._tags.splice(i, 1);
        }
        if (tag.state === constants.enums.tagStates.COMPLETE) {
            this.emit(constants.events.TAG_FOUND, tag);
            this._tags.splice(i, 1);
        }
    }
};

/*
 * Checks if adding this byte makes a valid id3v2 tag header.
 * @param byte the byte to add.
 * @private
 */
Id3Stream.prototype._checkHeader = function (byte) {
    this._addByteToData(byte);
    var lengthReached = this._headerData.length === constants.values.TAG_HEADER_LENGTH;
    if (lengthReached && this._headerTagValidator.containsHeaderBytes(this._headerData, this._start)) {
        var tag = new Tag(new TagHeader(this._headerData, this._start));
        this._checkImplementation(tag);
        this._tags.push(tag);
    }
};

/*
 * Check if the current tag does not contain any information we don't have a implementation for yet.
 * @private
 */
Id3Stream.prototype._checkImplementation = function (tag) {
    if (tag.header.version !== 3 ||
        tag.header.unsynchronisationIsSet ||
        tag.header.extendedHeaderIsSet) {
        throw(constants.messages.NOT_IMPLEMENTED);
    }
};

/*
 * The header has a fixed length. This function constantly keeps a array called _headerData with the same amount of
 * bytes. This array is used to find valid headers. There is a performance penalty for moving the bytes in the array.
 * That's why each* byte is inserted in the next spot and a _start property is kept to know where the bytes starting
 * position really is.
 * @param byte
 * @private
 */
Id3Stream.prototype._addByteToData = function (byte) {
    if (this._headerData.length < constants.values.TAG_HEADER_LENGTH) {
        this._headerData.push(byte);
    } else {
        this._start = this._start < constants.values.TAG_HEADER_LENGTH - 1 ? this._start + 1 : 0;
        var index = this._start - 1 === -1 ? constants.values.TAG_HEADER_LENGTH - 1 : this._start - 1;
        this._headerData[index] = byte;
    }
};