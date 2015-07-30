'use strict';

var TagHeader = require('../lib/tagHeader');
var constants = require('../lib/constants');

//ID3, Versiom: 4, Flags : all flags set, Size : 255.
var testArray = [0x49, 0x44, 0x33, 0x04, 0x00, 0x80 + 0x40 + 0x20 + 0x10, 0x00, 0x00, 0x01, 0x7F];
var testArrayStart6 = [0x00, 0x80 + 0x40 + 0x20 + 0x10, 0x00, 0x00, 0x01, 0x7F, 0x49, 0x44, 0x33, 0x04,];

describe('TagHeader', function () {
    var tagHeader;

    describe('constructor with correct array', function() {
        beforeEach(function () {
            tagHeader = new TagHeader(testArray, 0);
            spyOn(tagHeader.tagHeaderValidator, 'containsHeaderBytes').andCallFake(function (bytes, start) {
                return true;
            });
        });

        it('should set the correct version.', function () {
            // arrange

            // act

            // assert
            expect(tagHeader.version).toBe(0x04);
        });

        it('should set the unsynchronisation flag.', function () {
            // arrange

            // act

            // assert
            expect(tagHeader.unsynchronisationIsSet).toBeTruthy();
        });

        it('should set the Extended header flag.', function () {
            // arrange

            // act

            // assert
            expect(tagHeader.extendedHeaderIsSet).toBeTruthy();
        });

        it('should set the Experimental indicator flag.', function () {
            // arrange

            // act

            // assert
            expect(tagHeader.experimentalIndicatorIsSet).toBeTruthy();
        });

        it('should set the footer present flag.', function () {
            // arrange

            // act

            // assert
            expect(tagHeader.footerPresentIsSet).toBeTruthy();
        });

        it('should set the size.', function () {
            // arrange

            // act

            // assert
            expect(tagHeader.size).toBe(255);
        });
    });

    describe('constructor with correct array start 6', function() {
        beforeEach(function () {
            tagHeader = new TagHeader(testArrayStart6, 6);
            spyOn(tagHeader.tagHeaderValidator, 'containsHeaderBytes').andCallFake(function (bytes, start) {
                return true;
            });
        });

        it('should return correct properties if a valid ID3 tag header is provided but does not _start at the first byte.', function () {
            // arrange

            // act

            // assert
            expect(tagHeader.version).toBe(0x04);
            expect(tagHeader.unsynchronisationIsSet).toBeTruthy();
            expect(tagHeader.extendedHeaderIsSet).toBeTruthy();
            expect(tagHeader.experimentalIndicatorIsSet).toBeTruthy();
            expect(tagHeader.size).toBe(255);
        });
    });

    describe('constructor with wrong array', function() {
        it('should throw an exception if the array does not contain a valid header.', function () {
            // arrange
            var test = testArray.slice();
            test[0] = 0x48;

            // act and assert
            expect(function () {
                tagHeader = new TagHeader(test, 0);
            }).toThrow(new Error(constants.messages.NOT_A_TAG_HEADER));
        });
    });

    describe('_orderBytes', function(){
        beforeEach(function(){
            tagHeader = new TagHeader(testArrayStart6, 6);
        });

        it('should place the bytes after start at the beginning.', function () {
            // arange

            // act
            var result = tagHeader._orderBytes(testArrayStart6, 6);

            // assert
            expect(result).toEqual(testArray);
        });
    });
});
