'use strict';

var FrameHeader = require('../lib/frameHeader');
var constants = require('../lib/constants');

//Frame ID : TIT2, Size : 255, Flags : both bytes all flags set.
var testArray = [0x54, 0x49, 0x54, 0x32, 0x00, 0x00, 0x01, 0x7F, 0x80 + 0x40 + 0x20, 0x80 + 0x40 + 0x20];

describe('FrameHeader', function () {
    var frameHeader;
    describe('constructor with correct array', function() {
        beforeEach(function () {
            frameHeader = new FrameHeader(testArray);
            spyOn(frameHeader._frameHeaderValidator, 'containsHeaderBytes').andCallFake(function (bytes) {
                return true;
            });
        });

        it('should set the correct frame id.', function () {
            // arrange

            // act

            // assert
            expect(frameHeader.frameId).toBe('TIT2');
        });

        it('should set the size.', function () {
            // arrange

            // act

            // assert
            expect(frameHeader.size).toBe(383);
        });

        it('should set the Tag alter preservation flag.', function () {
            // arrange

            // act

            // assert
            expect(frameHeader.tagAlterPreservationIsSet).toBeTruthy();
        });

        it('should set the File alter preservation flag.', function () {
            // arrange

            // act

            // assert
            expect(frameHeader.fileAlterPreservationIsSet).toBeTruthy();
        });

        it('should set the Read only flag.', function () {
            // arrange

            // act

            // assert
            expect(frameHeader.readOnlyIsSet).toBeTruthy();
        });

        it('should set the Compression flag.', function () {
            // arrange

            // act

            // assert
            expect(frameHeader.compressionIsSet).toBeTruthy();
        });

        it('should set the Encryption flag.', function () {
            // arrange

            // act

            // assert
            expect(frameHeader.encryptionIsSet).toBeTruthy();
        });

        it('should set the Grouping identity flag.', function () {
            // arrange

            // act

            // assert
            expect(frameHeader.groupingIdentityIsSet).toBeTruthy();
        });

        it('should set the correct frameType', function () {
            // arange

            // act

            // assert
            expect(frameHeader.frameType).toBe(constants.enums.frameTypes.TEXT);
        });
    });

    describe('constructor with wrong array', function() {
        it('should throw an exception if the array does not contain a valid header.', function () {
            // arrange
            var test = testArray.slice();
            test[0] = 0x61;

            // act and assert
            expect(function () {
                frameHeader = new FrameHeader(test);
            }).toThrow(new Error(constants.messages.NOT_A_FRAME_HEADER));
        });
    });

    describe('constructor without array TIT2', function() {
        beforeEach(function () {
            frameHeader = new FrameHeader('TIT2');
        });

        it('should return de default with frameType TEXT', function () {
            // arange

            // act

            // assert
            expect(frameHeader.frameType).toBe(constants.enums.frameTypes.TEXT);
            expect(frameHeader.size).toBe(5);
            expect(frameHeader.tagAlterPreservationIsSet).toBeFalsy();
            expect(frameHeader.fileAlterPreservationIsSet).toBeFalsy();
            expect(frameHeader.readOnlyIsSet).toBeFalsy();
            expect(frameHeader.compressionIsSet).toBeFalsy();
            expect(frameHeader.encryptionIsSet).toBeFalsy();
            expect(frameHeader.groupingIdentityIsSet).toBeFalsy();
            expect(frameHeader.frameId).toBe('TIT2');
        });
    });

    describe('constructor without array PCNT', function() {
        beforeEach(function () {
            frameHeader = new FrameHeader('PCNT');
        });

        it('should return de default with frameType OTHER', function () {
            // arange

            // act

            // assert
            expect(frameHeader.frameType).toBe(constants.enums.frameTypes.OTHER);
            expect(frameHeader.frameId).toBe('PCNT');
        });
    });

    describe('_getFrameType', function () {
        beforeEach(function () {
            // De frameId is not really used in these test. But for  a real text frame it should start with a T.
            frameHeader = new FrameHeader('PCNT');
        });

        it('should return TEXT if called with a T', function () {
            // arange

            // act
            var result = frameHeader._getFrameType(0x54);

            // assert
            expect(result).toBe(constants.enums.frameTypes.TEXT);
        });

        it('should return OTHER if NOT called with a T', function () {
            // arange

            // act
            var result = frameHeader._getFrameType(0x56);

            // assert
            expect(result).toBe(constants.enums.frameTypes.OTHER);
        });
    });
});
