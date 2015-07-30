'use strict';

var BaseHeader = require('../lib/baseHeader');

describe('BaseHeader', function () {
    var baseHeader;

    beforeEach(function () {
        baseHeader = new BaseHeader();
    });

    describe('_byteArrayToInteger', function () {
        it('should convert the array for 383.', function () {
            // arange

            // act
            var result = baseHeader._byteArrayToInteger([0x00, 0x00, 0x01, 0x7F]);

            // assert
            expect(result).toBe(383);
        });

        it('should convert the array for 229247.', function () {
            // arange

            // act
            var result = baseHeader._byteArrayToInteger([0x00, 0x03, 0x7F, 0x7F])

            // assert
            expect(result).toBe(229247);
        });
    });

    describe('_syncsafeArrayToSize', function () {
        it('should set the correct size for 255.', function () {
            // arrange

            // act
            var result = baseHeader._syncsafeArrayToSize([0x00, 0x00, 0x01, 0x7F]);

            // assert
            expect(result).toBe(255);
        });

        it('should set the correct size for 65535.', function () {
            // arrange

            // act
            var result = baseHeader._syncsafeArrayToSize([0x00, 0x03, 0x7F, 0x7F]);

            // assert
            expect(result).toBe(65535);
        });
    });

    describe('_nonSyncsafeArrayToSize', function () {
        it('should call _byteArrayToInteger.', function () {
            // arange
            spyOn(baseHeader, '_byteArrayToInteger');

            // act
            baseHeader._nonSyncsafeArrayToSize([0x00, 0x03, 0x7F, 0x7F]);

            // assert
            expect(baseHeader._byteArrayToInteger).toHaveBeenCalled();
        });
    });
});
