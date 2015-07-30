'use strict';

var Id3Stream = require('../lib/id3Stream');
var constants = require('../lib/constants');

describe('Id3Stream', function () {
    var id3Stream;
    var done;
    var state;

    beforeEach(function () {
        done = jasmine.createSpy('done');
        id3Stream = new Id3Stream();
        var tag = jasmine.createSpyObj('tag', ['addByte', 'state']);
        tag.state = constants.enums.tagStates.COMPLETE;
        id3Stream._tags.push(tag);
    });

    describe('_write', function () {
        it('should call _checkHeader for every byte in the chunk', function () {
            // arange
            var done = jasmine.createSpy('done');
            spyOn(id3Stream, '_checkHeader');

            // act
            id3Stream._write([0x49, 0x44, 0x33], null, done);

            // assert
            expect(id3Stream._checkHeader.calls.length).toBe(3);
        });

        it('should call _checkTag for every byte in the chunk.', function () {
            // arange
            spyOn(id3Stream, '_checkTag');

            // act
            id3Stream._write([0x49, 0x44, 0x33], null, done);

            // assert
            expect(id3Stream._checkTag.calls.length).toBe(3);
        });

        it('should call done once', function () {
            // arange
            var done = jasmine.createSpy('done');

            // act
            id3Stream._write([0x49, 0x44, 0x33], null, done);

            // assert
            expect(done.calls.length).toBe(1);
        });
    });

    describe('_checkTag', function () {
        it('should emmit tagError if tag.Addbyte throws an error.', function () {
            // arange
            spyOn(id3Stream, "emit");
            id3Stream._tags[0].addByte.andCallFake(function(){
               throw(constants.messages.NOT_IMPLEMENTED);
            });

            // act
            var result = id3Stream._checkTag(0x7F);

            // assert
            expect(id3Stream.emit).toHaveBeenCalled();
        });

        it('should emit tagFound if tag.state is COMPLETE', function () {
            // arange
            spyOn(id3Stream, "emit");

            // act
            id3Stream._checkTag(0x7F);

            // assert
            expect(id3Stream.emit).toHaveBeenCalled();
        });

        it('should NOT emit tagFound if tag.state is NOT COMPLETE', function () {
            // arange
            spyOn(id3Stream, "emit");
            id3Stream._tags[0].state = constants.enums.tagStates.ADDING_FRAME_BYTES;

            // act
            id3Stream._checkTag(0x7F);

            // assert
            expect(id3Stream.emit).not.toHaveBeenCalled();
        });

        it('should call addByte', function () {
            // arange
            id3Stream._tags[0].state = constants.enums.tagStates.ADDING_FRAME_BYTES;

            // act
            id3Stream._checkTag(0x7F);

            // assert
            expect(id3Stream._tags[0].addByte).toHaveBeenCalled();
        });
    });

    describe('_checkHeader', function () {
        it('should create a tag if containsHeaderBytes returns true and array is 10 bytes long', function () {
            // arange
            id3Stream._headerData = [0x49, 0x44, 0x33, 0x03, 0x00, 0x00, 0x00, 0x00, 0x01];
            spyOn(id3Stream._headerTagValidator, 'containsHeaderBytes').andCallFake(function () {
                return true;
            });

            // act
            id3Stream._checkHeader(0x7F);

            // assert
            expect(id3Stream._tags[0]).not.toBeUndefined();
        });

        it('should NOT create a tag if containsHeaderBytes returns false even if array is 10 bytes long', function () {
            // arange
            // contents does not really mather because we create a fake containsHeaderBytes.
            id3Stream._headerData =  [0x49, 0x44, 0x33, 0x03, 0x00, 0x00, 0x00, 0x00, 0x01];
            spyOn(id3Stream._headerTagValidator, 'containsHeaderBytes').andCallFake(function () {
                return false;
            });

            // act
            id3Stream._checkHeader(0x7F);

            // assert
            expect(id3Stream._tags[0]).not.toBeUndefined();
        });

        it('should call _checkImplementation if containsHeaderBytes returns true.', function () {
            // arange
            id3Stream._headerData = [0x49, 0x44, 0x33, 0x03, 0x00, 0x00, 0x00, 0x00, 0x01];
            spyOn(id3Stream, '_checkImplementation');
            spyOn(id3Stream._headerTagValidator, 'containsHeaderBytes').andCallFake(function () {
                return true;
            });

            // act
            id3Stream._checkHeader(0x7F);

            // assert
            expect(id3Stream._checkImplementation).toHaveBeenCalled();
        });
    });

    describe('_checkImplementation', function () {
        it('should throw an exception if version is NOT 3', function () {
            // arange
            var tag = {
                header: {
                    version: 2,
                    unsynchronisationIsSet: false,
                    extendedHeaderIsSet: false
                }
            }

            // act and assert
            expect(function () {
                var result = id3Stream._checkImplementation(tag);
            }).toThrow(new Error(constants.messages.NOT_IMPLEMENTED));
        });

        it('should throw an exception if unsynchronisationIsSet is true', function () {
            // arange
            var tag = {
                header: {
                    version: 3,
                    unsynchronisationIsSet: true,
                    extendedHeaderIsSet: false
                }
            }

            // act and assert
            expect(function () {
                var result = id3Stream._checkImplementation(tag);
            }).toThrow(new Error(constants.messages.NOT_IMPLEMENTED));
        });

        it('should throw an exception if extendedHeaderIsSet is true', function () {
            // arange
            var tag = {
                header: {
                    version: 3,
                    unsynchronisationIsSet: false,
                    extendedHeaderIsSet: true
                }
            }

            // act and assert
            expect(function () {
                var result = id3Stream._checkImplementation(tag);
            }).toThrow(new Error(constants.messages.NOT_IMPLEMENTED));
        });
    });

    describe('_addByteToData', function () {
        it('should add the char at the end if the length is smaller then 10', function () {
            // arange
            id3Stream._headerData = [0x50, 0x44, 0x33, 0x04, 0x00, 0x80 + 0x40 + 0x20 + 0x10, 0x00, 0x00, 0x01];

            // act
            id3Stream._addByteToData(0x7F);

            // assert
            expect(id3Stream._headerData.length).toBe(10);
            expect(id3Stream._headerData[9]).toBe(0x7F);
        });

        it('should add the char before the _start position if the length is 10', function () {
            // arange
            id3Stream._headerData = [0x50, 0x44, 0x33, 0x04, 0x00, 0x80 + 0x40 + 0x20 + 0x10, 0x00, 0x00, 0x01, 0x7F];
            id3Stream._start = 5;

            // act
            id3Stream._addByteToData(0xAA);

            // assert
            expect(id3Stream._headerData.length).toBe(10);
            expect(id3Stream._start).toBe(5 + 1);
            expect(id3Stream._headerData[id3Stream._start - 1]).toBe(0xAA);
        });

        it('should set the _start position to 0 if it is 9', function () {
            // arange
            id3Stream._headerData = [0x50, 0x44, 0x33, 0x04, 0x00, 0x80 + 0x40 + 0x20 + 0x10, 0x00, 0x00, 0x01, 0x7F];
            id3Stream._start = 9;

            // act
            id3Stream._addByteToData(0xAA);

            // assert
            expect(id3Stream._headerData.length).toBe(10);
            expect(id3Stream._start).toBe(0);
            expect(id3Stream._headerData[9]).toBe(0xAA);
        });

    });
})
;