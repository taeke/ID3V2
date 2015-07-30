/*
 * Constants used in multiple source files and messages.
 */

'use strict';

var constants = {};

constants.events = {};
constants.events.TAG_FOUND = 'tagFound';
constants.events.TAG_ERROR = 'tagError';

constants.values = {};
constants.values.TAG_HEADER_LENGTH = 10;
constants.values.FRAME_HEADER_LENGTH = 10;
constants.values.SIZE_BYTES_LENGTH = 4;
constants.values.FRAME_ID_LENGTH = 4;
constants.values.bitMasks = [0x01, 0x02, 0x04, 0x08, 0x10, 0x20, 0x40, 0x80];

constants.messages = {};
constants.messages.NOT_A_TAG_HEADER = 'Array does not contain a ID3v2 tag header.';
constants.messages.NOT_A_FRAME_HEADER = 'Array does not contain a ID3v2 frame header.';
constants.messages.START_NOT_WITHIN_ARRAY = 'The start position is not within the array.';
constants.messages.BYTE_ADDED_AFTER_COMPLETE = 'The tag or frame is already complete.';
constants.messages.DONT_CALL_ON_BASE_CLASS = 'This function should not be called on the base class.';
constants.messages.FRAME_MUST_BE_COMPLETE = 'The frame must be complete if the tag is complete.';
constants.messages.PADDING_ONLY_WITH_0 = 'For padding only 0 can be used.';
constants.messages.NOT_IMPLEMENTED = 'This feature is not yet implemented.';
constants.messages.ONLY_ON_TEXT_FRAMES = 'This function can only be called on TEXT frames.';
constants.messages.ONLY_ON_COMPLETE_FRAMES = 'This function can only be called on COMPLETE frames.';
constants.messages.UNKNOWN_ENCODING = 'The encoding byte is not a known encoding type.';
constants.messages.NO_FRAMES_FOUND = 'There is no frame to add the byte to.'

constants.enums = {};
constants.enums.frameStates = {ADDING_DATA: 1, COMPLETE: 2, NO_FRAME_FOUND: 3};
constants.enums.frameTypes = {TEXT: 1, OTHER: 2};
constants.enums.tagStates = {CREATING_FRAME_HEADER: 1, ADDING_FRAME_BYTES: 2, PADDING: 3, COMPLETE: 4};

module.exports = constants;
