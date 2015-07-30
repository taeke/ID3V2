'use strict';

var TagHeaderValidator = require('../lib/tagHeaderValidator');
var constants = require('../lib/constants');

//ID3, Versiom: 4, Flags : all flags set, Size : 255.
var testArray = [0x49, 0x44, 0x33, 0x04, 0x00, 0x80 + 0x40 + 0x20 + 0x10, 0x00, 0x00, 0x01, 0x7F];
var testArrayStart6 = [0x00, 0x80 + 0x40 + 0x20 + 0x10, 0x00, 0x00, 0x01, 0x7F, 0x49, 0x44, 0x33, 0x04,];

describe('TagHeaderValidator', function () {
    var tagHeaderValidator;

    beforeEach(function () {
        tagHeaderValidator = new TagHeaderValidator();
    });

    describe('containsHeaderBytes', function () {
        it('should call _containgsHeader function.', function () {
            // arange
            spyOn(tagHeaderValidator, '_containsHeaderBytes');

            // act
            var result = tagHeaderValidator.containsHeaderBytes(testArray, 3);

            // assert
            expect(tagHeaderValidator._containsHeaderBytes).toHaveBeenCalled();
        });

        it('should throw an exception if _start is not within array.', function () {
            // arange

            // act and assert
            expect(function () {
                var result = tagHeaderValidator.containsHeaderBytes(testArray, 10);
            }).toThrow(new Error(constants.messages.START_NOT_WITHIN_ARRAY));
        });

        it('should return the result from _containsHeaderBytes.', function () {
            // arange
            spyOn(tagHeaderValidator, '_containsHeaderBytes').andCallFake(function (bytes) {
                return true;
            });

            // act
            var result = tagHeaderValidator.containsHeaderBytes(testArray, 0);

            // assert
            expect(result).toBeTruthy();
        });

        it('should return true if a valid header array is provided.', function () {
            // arange

            // act
            var result = tagHeaderValidator.containsHeaderBytes(testArray, 0);

            // assert
            expect(result).toBeTruthy();
        });

        it('should return true if a valid header array is provided which does not _start at 0.', function () {
            // arange

            // act
            var result = tagHeaderValidator.containsHeaderBytes(testArrayStart6, 6);

            // assert
            expect(result).toBeTruthy();
        });
    });

    describe('_checkByteValidator', function () {
        it('should call _calculatePosition', function () {
            // arange
            spyOn(tagHeaderValidator, '_calculatePosition');

            // act
            tagHeaderValidator._checkByteValidator(testArray, 0);

            // assert
            expect(tagHeaderValidator._calculatePosition).toHaveBeenCalled();
        });

        it('should return true if the byte at index is a valid value.', function () {
            // arange

            // act
            var result = tagHeaderValidator._checkByteValidator(testArray, 5);

            // assert
            expect(result).toBeTruthy();
        });
    });

    describe('_calculatePosition', function () {
        it('should return correct position if _start is 0', function () {
            // arange

            // act
            var result = tagHeaderValidator._calculatePosition(5, 0);

            // assert
            expect(result).toBe(5);
        });

        it('should return correct position if _start + position is smaller then header length', function () {
            // arange

            // act
            var result = tagHeaderValidator._calculatePosition(5, 4);

            // assert
            expect(result).toBe(9);
        });

        it('should return correct position if _start + position is bigger then header length', function () {
            // arange

            // act
            var result = tagHeaderValidator._calculatePosition(5, 5);

            // assert
            expect(result).toBe(0);
        });
    });

    describe('_byteValidators', function () {
        it('should have correct _byteValidators.', function () {
            // arrange

            // act

            // assert
            expect(tagHeaderValidator._byteValidators[0].call(tagHeaderValidator, 0x49)).toBeTruthy();
            expect(tagHeaderValidator._byteValidators[0].call(tagHeaderValidator, 0x48)).toBeFalsy();

            expect(tagHeaderValidator._byteValidators[1].call(tagHeaderValidator, 0x44)).toBeTruthy();
            expect(tagHeaderValidator._byteValidators[1].call(tagHeaderValidator, 0x43)).toBeFalsy();

            expect(tagHeaderValidator._byteValidators[2].call(tagHeaderValidator, 0x33)).toBeTruthy();
            expect(tagHeaderValidator._byteValidators[2].call(tagHeaderValidator, 0x32)).toBeFalsy();

            expect(tagHeaderValidator._byteValidators[3].call(tagHeaderValidator, 0x04)).toBeTruthy();
            expect(tagHeaderValidator._byteValidators[3].call(tagHeaderValidator, 0x05)).toBeFalsy();

            expect(tagHeaderValidator._byteValidators[4].call(tagHeaderValidator, 0x00)).toBeTruthy();
            expect(tagHeaderValidator._byteValidators[4].call(tagHeaderValidator, 0x01)).toBeFalsy();

            expect(tagHeaderValidator._byteValidators[5].call(tagHeaderValidator, 0x80 + 0x40 + 0x20 + 0x10)).toBeTruthy();
            expect(tagHeaderValidator._byteValidators[5].call(tagHeaderValidator, 0x03)).toBeFalsy();

            expect(tagHeaderValidator._byteValidators[6].call(tagHeaderValidator, 0x00)).toBeTruthy();
            expect(tagHeaderValidator._byteValidators[6].call(tagHeaderValidator, 0xFF)).toBeFalsy();

            expect(tagHeaderValidator._byteValidators[7].call(tagHeaderValidator, 0x00)).toBeTruthy();
            expect(tagHeaderValidator._byteValidators[7].call(tagHeaderValidator, 0xFF)).toBeFalsy();

            expect(tagHeaderValidator._byteValidators[8].call(tagHeaderValidator, 0x00)).toBeTruthy();
            expect(tagHeaderValidator._byteValidators[8].call(tagHeaderValidator, 0xFF)).toBeFalsy();

            expect(tagHeaderValidator._byteValidators[9].call(tagHeaderValidator, 0x00)).toBeTruthy();
            expect(tagHeaderValidator._byteValidators[9].call(tagHeaderValidator, 0xFF)).toBeFalsy();
        });
    });
});