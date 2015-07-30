'use strict';

var BaseHeaderValidator = require('../lib/baseHeaderValidator');
var constants = require('../lib/constants');

describe('BaseHeaderValidator', function () {
    var headerBaseValidator;

    beforeEach(function () {
        headerBaseValidator = new BaseHeaderValidator(10);
    });

    describe('_containsHeaderBytes', function () {
        it('should return false if the array size is not equal to the validator size.', function () {
            // arrange
            spyOn(headerBaseValidator, '_checkByteValidator').andCallFake(function (bytes, index) {
                return true;
            });

            // act
            var result = headerBaseValidator._containsHeaderBytes([0x49, 0x44, 0x33, 0x04, 0x00, 0x80 + 0x40 + 0x20 + 0x10, 0x00, 0x00, 0x01]);

            // assert
            expect(result).toBeFalsy();
        });

        it('should call _checkValidator until _checkByteValidator returns false.', function () {
            // arange
            spyOn(headerBaseValidator, '_checkByteValidator').andCallFake(function (bytes, index) {
                return !(index === 4);
            });

            // act
            var result = headerBaseValidator._containsHeaderBytes([0x49, 0x44, 0x33, 0x04, 0x00, 0x80 + 0x40 + 0x20 + 0x10, 0x00, 0x00, 0x01, 0x07]);

            // assert
            expect(headerBaseValidator._checkByteValidator.calls.length).toBe(5);
        });

        it('should return false if not all validator return true.', function () {
            spyOn(headerBaseValidator, '_checkByteValidator').andCallFake(function (bytes, index) {
                return !(index === 4);
            });

            // act
            var result = headerBaseValidator._containsHeaderBytes([0x49, 0x44, 0x33, 0x04, 0x00, 0x80 + 0x40 + 0x20 + 0x10, 0x00, 0x00, 0x01, 0x07]);

            // assert
            expect(result).toBeFalsy();
        });

        it('should return true if all _validators return true.', function () {
            // arange
            spyOn(headerBaseValidator, '_checkByteValidator').andCallFake(function (bytes, index) {
                return true;
            });

            // act
            var result = headerBaseValidator._containsHeaderBytes([0x49, 0x44, 0x33, 0x04, 0x00, 0x80 + 0x40 + 0x20 + 0x10, 0x00, 0x00, 0x01, 0x07]);

            // assert
            expect(result).toBeTruthy();
        });
    });

    describe('_checkByteValidator', function () {
        it('should throw an exception if it is called directly on the base class.', function () {
            // arange

            // act and assert
            expect(function () {
                var result = headerBaseValidator._checkByteValidator([0x49, 0x44, 0x33, 0x04, 0x00, 0x80 + 0x40 + 0x20 + 0x10, 0x00, 0x00, 0x01, 0x07], 0);
            }).toThrow(new Error(constants.messages.DONT_CALL_ON_BASE_CLASS));
        });
    });

    describe('_bitsAreNotSet', function () {
        it('should return true if bit 3 is not set but bit 2 and bit 4 are set.', function () {
            // arange

            // act bit 2 : 0x4 + bit 4 : 0x10 = 0x14
            var result = headerBaseValidator._bitsAreNotSet(0x14, [3]);

            // assert
            expect(result).toBeTruthy();
        });

        it('should return false if bit 2, 3 and 4 are set.', function () {
            // arange

            // act bit 2 : 0x4 + bit 3 : 0x08 + bit 4 = 0x10 = 0x1C
            var result = headerBaseValidator._bitsAreNotSet(0x1C, [3]);

            // assert
            expect(result).toBeFalsy();
        });
    });

    describe('_isOneOfTheBytes', function () {
        it('should return false if byte is not in bytes.', function () {
            // arange

            // act
            var result = headerBaseValidator._isOneOfTheBytes(0x48, [0x049, 0x50]);

            // assert
            expect(result).toBeFalsy();
        });

        it('should return true if byte is in bytes.', function () {
            // arange

            // act
            var result = headerBaseValidator._isOneOfTheBytes(0x49, [0x49, 0x50]);

            // assert
            expect(result).toBeTruthy();
        });
    });
});
