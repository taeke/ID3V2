'use strict';

var FrameHeaderValidator = require('../lib/frameHeaderValidator');
var constants = require('../lib/constants');

//Frame ID : TIT2, Size : 255, Flags : both bytes all flags set.
var testArray = [0x54, 0x49, 0x54, 0x32, 0x00, 0x00, 0x01, 0x7F, 0x80 + 0x40 + 0x20, 0x80 + 0x40 + 0x20];

describe('FrameHeaderValidator', function () {
    var frameHeaderValidator;

    beforeEach(function () {
        frameHeaderValidator = new FrameHeaderValidator();
    });

    describe('_createByteRange', function() {
        it('should create a range of bytes.', function () {
            // arange

            // act
            var result = frameHeaderValidator._createByteRange(0x54, 0x56);

            // assert
            expect(result[0]).toBe(0x54);
            expect(result[1]).toBe(0x55);
            expect(result[2]).toBe(0x56);
            expect(result.length).toBe(3);
        });
    });

    describe('containsHeaderBytes', function () {
        it('should call _containgsHeader function.', function () {
            // arange
            spyOn(frameHeaderValidator, '_containsHeaderBytes');

            // act
            var result = frameHeaderValidator.containsHeaderBytes(testArray, 3);

            // assert
            expect(frameHeaderValidator._containsHeaderBytes).toHaveBeenCalled();
        });

        it('should return the result from _containsHeaderBytes.', function () {
            // arange
            spyOn(frameHeaderValidator, '_containsHeaderBytes').andCallFake(function (bytes) {
                return true;
            });

            // act
            var result = frameHeaderValidator.containsHeaderBytes(testArray, 0);

            // assert
            expect(result).toBeTruthy();
        });

        it('should return true if a valid header array is provided.', function () {
            // arange

            // act
            var result = frameHeaderValidator.containsHeaderBytes(testArray);

            // assert
            expect(result).toBeTruthy();
        });
    });

    describe('_checkByteValidator', function () {
        it('should return true if the byte at index is a valid value.', function () {
            // arange

            // act
            var result = frameHeaderValidator._checkByteValidator(testArray, 5);

            // assert
            expect(result).toBeTruthy();
        });
    });

    describe('_byteValidators', function () {
        it('should have correct _byteValidators.', function () {
            // arrange

            // act

            // assert
            expect(frameHeaderValidator._byteValidators[0](0x49)).toBeTruthy(); // I
            expect(frameHeaderValidator._byteValidators[0](0x61)).toBeFalsy(); // a

            expect(frameHeaderValidator._byteValidators[1](0x49)).toBeTruthy();
            expect(frameHeaderValidator._byteValidators[1](0x61)).toBeFalsy();

            expect(frameHeaderValidator._byteValidators[2](0x49)).toBeTruthy();
            expect(frameHeaderValidator._byteValidators[2](0x61)).toBeFalsy();

            expect(frameHeaderValidator._byteValidators[3](0x49)).toBeTruthy();
            expect(frameHeaderValidator._byteValidators[3](0x61)).toBeFalsy();

            expect(frameHeaderValidator._byteValidators[4](0x00)).toBeTruthy();
            expect(frameHeaderValidator._byteValidators[4](0xFF)).toBeTruthy();

            expect(frameHeaderValidator._byteValidators[5](0x00)).toBeTruthy();
            expect(frameHeaderValidator._byteValidators[5](0xFF)).toBeTruthy();

            expect(frameHeaderValidator._byteValidators[6](0x00)).toBeTruthy();
            expect(frameHeaderValidator._byteValidators[6](0xFF)).toBeTruthy();

            expect(frameHeaderValidator._byteValidators[7](0x00)).toBeTruthy();
            expect(frameHeaderValidator._byteValidators[7](0xFF)).toBeTruthy();

            expect(frameHeaderValidator._byteValidators[8](0x80 + 0x40 + 0x20)).toBeTruthy();
            expect(frameHeaderValidator._byteValidators[8](0x03)).toBeFalsy();

            expect(frameHeaderValidator._byteValidators[9](0x80 + 0x40 + 0x20)).toBeTruthy();
            expect(frameHeaderValidator._byteValidators[9](0x03)).toBeFalsy();
        });
    });

});
