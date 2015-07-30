'use strict';

var Tag = require('../lib/tag');
var constants = require('../lib/constants');

describe('Tag', function () {
    var tag;
    var tagHeader;

    beforeEach(function () {
        tagHeader = {};
        tagHeader.size = 24;
        tag = new Tag(tagHeader);
    });

    describe('constructor', function () {
        it('should create properties for all declared Text frameIds.', function () {
            // arange

            // act

            // assert
            expect(tag.TIT2).toBeDefined();
        });
    });

    describe('addByte', function () {
        it('should throw an exception if the tag is already complete', function () {
            // arange
            tag.state = constants.enums.tagStates.COMPLETE;

            // act and assert
            expect(function () {
                tag.addByte(0xAA);
            }).toThrow(new Error(constants.messages.BYTE_ADDED_AFTER_COMPLETE));
        });

        it('should call _incrementCount if state is NOT COMPLETE.', function () {
            // arange
            spyOn(tag, '_incrementCount');
            spyOn(tag, '_checkImplementation').andCallFake(function () {
            });

            // act
            tag.addByte(0x54);

            // assert
            expect(tag._incrementCount).toHaveBeenCalled();
        });

        it('should call _addByteToFrame if state is ADDING_FRAME.', function () {
            // arange
            tag.state = constants.enums.tagStates.ADDING_FRAME_BYTES;
            spyOn(tag, '_addByteToFrame');
            spyOn(tag, '_checkImplementation').andCallFake(function () {
            });

            // act
            tag.addByte(0x54);

            // assert
            expect(tag._addByteToFrame).toHaveBeenCalled();
        });

        it('should call _padding if state is PADDING.', function () {
            // arange
            tag.state = constants.enums.tagStates.PADDING;
            spyOn(tag, '_padding');
            spyOn(tag, '_checkImplementation').andCallFake(function () {
            });

            // act
            tag.addByte(0x54);

            // assert
            expect(tag._padding).toHaveBeenCalled();
        });
    });

    describe('getFrame', function () {
        it('should return the frame with the right frameId', function () {
            // arange
            tag._frames.push({
                header: {
                    frameId: 'TPE1'
                }
            });
            tag._frames.push({
                header: {
                    frameId: 'TALB'
                }
            });

            // act
            var result = tag.getFrame('TALB');

            // assert
            expect(result.header.frameId).toBe('TALB');
        })

        it('should return a default frame if frameId is not present', function () {
            // arange

            // act
            var result = tag.getFrame('TALB');

            // assert
            expect(result.header.frameId).toBe('TALB');
        });
    });

    describe('_isFrameIdUnique', function () {
        it('should return false if a frame with the same id is found.', function () {
            // arange
            tag._frames = [{frameId:'TIT2'}];

            // act
            var result = tag._isFrameIdUnique('TIT2');

            // assert
            expect(result).toBeFalsy();
        });

        it('should return true if no frame is found with the same id.', function () {
            // arange
            tag._frames = [{frameId:'TIT2'}];

            // act
            var result = tag._isFrameIdUnique('TIT1');

            // assert
            expect(result).toBeTruthy();
        });
    });

    describe('_checkImplementation', function () {
        it('should throw an exception if it is a TEXT frame and compressionIsSet is true', function () {
            // arange
            var frame = {
                frameId: 'TIT2',
                header: {
                    frameType: constants.enums.frameTypes.TEXT
                },
                compressionIsSet: true,
                encryptionIsSet: false
            };

            // act and assert
            expect(function () {
                tag._checkImplementation(frame);
            }).toThrow(new Error(constants.messages.NOT_IMPLEMENTED));
        });

        it('should throw an exception if it is a TEXT frame and compressionIsSet is true', function () {
            // arange
            var frame = {
                frameId: 'TIT2',
                header: {
                    frameType: constants.enums.frameTypes.TEXT
                },
                compressionIsSet: false,
                encryptionIsSet: true
            };

            // act and assert
            expect(function () {
                tag._checkImplementation(frame);
            }).toThrow(new Error(constants.messages.NOT_IMPLEMENTED));
        });

        it('should throw an exception if there is allready a frame with the same Id.', function () {
            // arange
            var frame = {
                frameId: 'TIT2',
                header: {
                    frameType: constants.enums.frameTypes.TEXT
                },
                compressionIsSet: false,
                encryptionIsSet: false
            };

            tag._frames = [{
                frameId: 'TIT2'
            }];

            spyOn(tag, '_isFrameIdUnique').andReturn(false);

            // act and assert
            expect(function () {
                tag._checkImplementation(frame);
            }).toThrow(new Error(constants.messages.NOT_IMPLEMENTED));
        });
    });

    describe('_incrementCount', function () {
        it('should increment _count', function () {
            // arange

            // act
            tag._incrementCount();

            // assert
            expect(tag._count).toBe(1);
        });

        it('should set state to COMPLETE if _count + 1 is header.size', function () {
            // arange
            spyOn(tag, '_lastFrameState').andCallFake(function () {
                return constants.enums.frameStates.COMPLETE
            });

            tag._count = 23;

            // act
            tag._incrementCount();

            // assert
            expect(tag.state).toBe(constants.enums.tagStates.COMPLETE);
        });
    });

    describe('_changeState', function () {
        it('should throw an exception if changing from ADDING_FRAME_BYTES to COMPLETE and last frame is NOT COMPLETE', function () {
            // arange
            spyOn(tag, '_lastFrameState').andCallFake(function () {
                return constants.enums.frameStates.ADDING_DATA
            });

            tag.state = constants.enums.tagStates.ADDING_FRAME_BYTES;

            // act and assert
            expect(function () {
                tag._changeState(constants.enums.tagStates.COMPLETE);
            }).toThrow(new Error(constants.messages.FRAME_MUST_BE_COMPLETE));
        });

        it('should NOT throw an exception if changing from ADDING_FRAME_BYTES to COMPLETE and the last frame is COMPLETE', function () {
            // arange
            spyOn(tag, '_lastFrameState').andCallFake(function () {
                return constants.enums.frameStates.COMPLETE
            });

            tag.state = constants.enums.tagStates.ADDING_FRAME_BYTES;

            // act and assert
            expect(function () {
                tag._changeState(Tag.frameStates.COMPLETE);
            }).not.toThrow(new Error(constants.messages.FRAME_MUST_BE_COMPLETE));
        });

        it('should throw an exception if changing from ADDING_FRAME_BYTES to PADDING and last frame is NOT COMPLETE', function () {
            // arange
            spyOn(tag, '_lastFrameState').andCallFake(function () {
                return constants.enums.frameStates.ADDING_DATA
            });

            tag.state = constants.enums.tagStates.ADDING_FRAME_BYTES;

            // act and assert
            expect(function () {
                tag._changeState(constants.enums.tagStates.PADDING);
            }).toThrow(new Error(constants.messages.FRAME_MUST_BE_COMPLETE));
        });

        it('should NOT throw an exception if changing from ADDING_FRAME_BYTES to PADDING and the last frame is COMPLETE', function () {
            // arange
            tag.state = constants.enums.tagStates.ADDING_FRAME_BYTES;

            // act and assert
            expect(function () {
                tag._changeState(Tag.frameStates.PADDING);
            }).not.toThrow(new Error(constants.messages.FRAME_MUST_BE_COMPLETE));
        });
    });

    describe('_addByteToFrame', function () {
        it('should throw an exception if no frames are present.', function () {
            // arange

            // act and assert
            expect(function () {
                tag._addByteToFrame(0x49);
            }).toThrow(new Error(constants.messages.NO_FRAMES_FOUND));
        });

        it('should call changeState if lastFrameState returns COMPLETE', function () {
            // arange
            spyOn(tag, '_changeState');
            var frame = jasmine.createSpyObj('frame', ['addByte']);
            tag._frames = [frame];
            spyOn(tag, '_lastFrameState').andCallFake(function () {
                return constants.enums.frameStates.COMPLETE;
            });

            // act
            tag._addByteToFrame(0x49);

            // assert
            expect(tag._lastFrameState).toHaveBeenCalled();
        });
    });

    describe('_lastFrameState', function () {
        it('should return the state from the last frame', function () {
            // arange
            var frame1 = {state: constants.enums.frameStates.ADDING_DATA};
            var frame2 = {state: constants.enums.frameStates.COMPLETE};
            tag._frames = [frame1, frame2];

            // act
            var result = tag._lastFrameState();

            // assert
            expect(result).toBe(constants.enums.frameStates.COMPLETE);
        });

        it('should return NO_FRAME_FOUND when there are no frames.', function () {
            // arange

            // act
            var result = tag._lastFrameState();

            // assert
            expect(result).toBe(constants.enums.frameStates.NO_FRAME_FOUND);
        });
    });

    describe('_padding', function () {
        it('should throw an exception if it is called with a byte !== 0', function () {
            // arange

            // act and assert
            expect(function () {
                tag._padding(0x01);
            }).toThrow(new Error(constants.messages.PADDING_ONLY_WITH_0));
        });
    });

    describe('_addByteToFrameHeader', function () {
        it('should add the byte to frameHeaderBytes', function () {
            // arange

            // act
            tag._addByteToFrameHeader(0x40);

            // assert
            expect(tag._frameHeaderBytes.length).toBe(1);
            expect(tag._frameHeaderBytes[0]).toBe(0x40);
        });

        it('should create a frame header if the last header byte gets added.', function () {
            // arange
            tag._frameHeaderBytes = [0x54, 0x49, 0x54, 0x32, 0x00, 0x00, 0x01, 0x7F, 0x80 + 0x40 + 0x20];

            // act
            tag._addByteToFrameHeader(0x80 + 0x40 + 0x20);

            // assert
            expect(tag._frames.length).toBe(1);
        });

        it('should set isInSourceStream to true on the frame if the last header byte gets added.', function () {
            // arange
            tag._frameHeaderBytes = [0x54, 0x49, 0x54, 0x32, 0x00, 0x00, 0x01, 0x7F, 0x80 + 0x40 + 0x20];

            // act
            tag._addByteToFrameHeader(0x80 + 0x40 + 0x20);

            // assert
            expect(tag._frames[0].isInSourceStream).toBeTruthy();
        });

        it('should set state to ADDDING_FRAME_BYTES', function () {
            // arange
            tag.state = constants.enums.tagStates.CREATING_FRAME_HEADER;
            tag._frameHeaderBytes = [0x54, 0x49, 0x54, 0x32, 0x00, 0x00, 0x01, 0x7F, 0x80 + 0x40 + 0x20];

            // act
            tag._addByteToFrameHeader(0x80 + 0x40 + 0x20);

            // assert
            expect(tag.state).toBe(constants.enums.tagStates.ADDING_FRAME_BYTES);
        });

        it('should keep state to CREATING_FRAME_HEADER if header.length = 0', function () {
            // arange
            tag.state = constants.enums.tagStates.CREATING_FRAME_HEADER;
            tag._frameHeaderBytes = [0x54, 0x49, 0x54, 0x32, 0x00, 0x00, 0x00, 0x00, 0x80 + 0x40 + 0x20];

            // act
            tag._addByteToFrameHeader(0x80 + 0x40 + 0x20);

            // assert
            expect(tag.state).toBe(constants.enums.tagStates.CREATING_FRAME_HEADER);
        });

        it('should set state to PADDING', function () {
            // arange
            spyOn(tag, '_lastFrameState').andCallFake(function () {
                return constants.enums.frameStates.COMPLETE
            });

            tag.state = constants.enums.tagStates.CREATING_FRAME_HEADER;

            // act
            tag._addByteToFrameHeader(0x00);

            // assert
            expect(tag.state).toBe(constants.enums.tagStates.PADDING);
        });

        it('should clear the frameHeaderBytes', function () {
            // arange
            tag.state = constants.enums.tagStates.CREATING_FRAME_HEADER;
            tag._frameHeaderBytes = [0x54, 0x49, 0x54, 0x32, 0x00, 0x00, 0x01, 0x7F, 0x80 + 0x40 + 0x20];

            // act
            tag._addByteToFrameHeader(0x80 + 0x40 + 0x20);

            // assert
            expect(tag._frameHeaderBytes.length).toBe(0);
        });
    });
});