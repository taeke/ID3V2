'use strict';

var Frame = require('../lib/frame');
var constants = require('../lib/constants');

describe('Frame', function () {
    var frame;
    describe('constructor', function(){
        it('should set state to COMPLETE if header size = 0', function () {
            // arange
            var header = {
                size: 0
            };

            // act
            frame = new Frame(header);

            // assert
            expect(frame.state).toBe(constants.enums.frameStates.COMPLETE);
        });

        it('should set state to ADDING_DATA if header size is NOT 0', function () {
            // arange
            var header = {
                size: 1
            };

            // act
            frame = new Frame(header);

            // assert
            expect(frame.state).toBe(constants.enums.frameStates.ADDING_DATA);
        });

        it('should set isInSourceStream to false.', function () {
            // arange
            var header = {
                size: 0
            };

            // act
            frame = new Frame(header);

            // assert
            expect(frame.isInSourceStream).toBeDefined();
            expect(frame.isInSourceStream).toBeFalsy();
        });
    });

    describe('_getDefaultFrame', function () {
        it('should return a default frame.', function () {
            // arange

            // act
            var result = Frame._getDefaultFrame('TIT2');

            // assert
            expect(result).toBeDefined();
        });

        it('should set an encoding byte if it is a text frame.', function () {
            // arange

            // act
            var result = Frame._getDefaultFrame('TIT2');

            // assert
            expect(result.data.length).toBe(5);
            expect(result.data[0]).toBe(0x01);
        });

        it('should set an encoding byte if it is a text frame.', function () {
            // arange

            // act
            var result = Frame._getDefaultFrame('MCDI');

            // assert
            expect(result.data.length).toBe(0);
        });
    });

    describe('addByte', function () {
        beforeEach(function () {
            var header = {
                size: 1
            };

            frame = new Frame(header);
        });

        it('should throw an exception if the frame state is COMPLETE', function () {
            // arange
            frame.state = constants.enums.frameStates.COMPLETE;

            // act and assert
            expect(function () {
                frame.addByte(0xAA);
            }).toThrow(new Error(constants.messages.BYTE_ADDED_AFTER_COMPLETE));
        });

        it('should call _setEncoding', function () {
            // arange
            spyOn(frame, '_setEncoding');

            // act
            frame.addByte(0x50);

            // assert
            expect(frame._setEncoding).toHaveBeenCalled();
        });

        it('should writeUInt8 to data if header.frameType is OTHER', function () {
            // arange
            frame.data = new Buffer(255);
            spyOn(frame.data, 'writeUInt8').andCallThrough();
            frame._count = 4;
            frame.header = {size: 255, frameType: constants.enums.frameTypes.OTHER};

            // act
            frame.addByte(0x54);

            // assert
            expect(frame.data.writeUInt8).toHaveBeenCalled();
            expect(frame.data[4]).toBe(0x54);
        });

        it('should set the state to COMPLETE if _count is header.size.', function () {
            // arange
            frame.data = new Buffer(255);
            frame._count = 254;
            frame.header = {size: 255, frameType: constants.enums.frameTypes.TEXT};

            // act
            frame.addByte(0x54);

            // assert
            expect(frame.state).toBe(constants.enums.frameStates.COMPLETE);
        });
    });

    describe('getText', function () {
        beforeEach(function () {
            var header = {
                size: 1
            };

            frame = new Frame(header);
        });

        it('should throw an exception if it is not a TEXT frame', function () {
            // arange
            frame.state = constants.enums.frameStates.COMPLETE;
            frame.header = {frameType: constants.enums.frameTypes.OTHER};

            // act and assert
            expect(function () {
                frame.getText();
            }).toThrow(new Error(constants.messages.ONLY_ON_TEXT_FRAMES));
        });

        it('should throw an exception when frame state is not COMPLETE', function () {
            // arange
            frame.state = constants.enums.frameStates.ADDING_DATA;
            frame.header = {frameType: constants.enums.frameTypes.TEXT};

            // act and assert
            expect(function () {
                frame.getText();
            }).toThrow(new Error(constants.messages.ONLY_ON_COMPLETE_FRAMES));
        });

        it('should throw an exception when textFrameEnconding is not set.', function () {
            // arange
            frame.state = constants.enums.frameStates.COMPLETE;
            frame.header = {frameType: constants.enums.frameTypes.TEXT};

            // act and assert
            expect(function () {
                frame.getText();
            }).toThrow(new Error('Encoding not recognized: \'undefined\' (searched as: \'undefined\')'));
        });

        it('should return the decoded text', function () {
            // arange
            frame.state = constants.enums.frameStates.COMPLETE;
            frame.header = {frameType: constants.enums.frameTypes.TEXT};
            frame.textFrameEncoding = Frame.textFrameEncodings[0x01];
            frame.data = new Buffer([0x01, 0xFF, 0xFE, 0x43, 0x00, 0x6C, 0x00, 0x61, 0x00, 0x70, 0x00, 0x74, 0x00, 0x6F, 0x00, 0x6E, 0x00, 0x20, 0x00, 0x45, 0x00, 0x72, 0x00, 0x69, 0x00, 0x63, 0x00, 0x00]);;
                                   //                    C         l           a           p           t           o           n           space       E           r           i           c
            // act
            var result = frame.getText();

            // assert
            expect(result).toBe('Clapton Eric');
        });
    });

    describe('_setEncoding', function () {
        beforeEach(function () {
            var header = {
                size: 1
            };

            frame = new Frame(header);
        });

        it('should set encoding on the frame', function () {
            // arange
            frame.data = new Buffer(255);
            frame.header = {frameType: constants.enums.frameTypes.TEXT};
            frame._count = 1;

            // act
            frame._setEncoding(0x01);

            // assert
            expect(frame.textFrameEncoding).toBe(Frame.textFrameEncodings[0x01]);
        });

        it('should throw unknown encoding if byte is not in textFrameEncodings on the frame', function () {
            // arange
            frame.data = new Buffer(255);
            frame.header = {frameType: constants.enums.frameTypes.TEXT};
            frame._count = 1;

            // act and assert
            expect(function () {
                frame._setEncoding(0x04);
                console.log(frame.textFrameEncoding);
            }).toThrow(new Error(constants.messages.UNKNOWN_ENCODING));
        });
    });
});


