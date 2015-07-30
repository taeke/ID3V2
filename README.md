#ID3V2
Reading ID3 Version 2 tags from a stream for node.
```javascript
var fs = require('fs');
var id3v2 = require('ID3V2');
var readStream = fs.createReadStream('example.mp3');
var id3Stream = new id3v2.Id3Stream();
id3Stream.on(id3v2.constants.events.TAG_FOUND, function (tag) {
    console.log('Album/Movie/Show title : ' + tag.TALB);
    console.log('Lead performer(s)/Soloist(s) : ' + tag.TPE1);
    console.log('Title/Songname/Content description : ' + tag.TIT2);
    console.log('Date : ' + tag.TDAT);
});

readStream.pipe(id3Stream);
```
All text frames except TXXX can be accessed this way. Other frame types can be accessed by using:
```javascript
var pcntFrame = tag.getFrame('PCNT');
```
The pcntFrame instance has a data property holding the content of the tag. Text frames can also be accessed this way. The data property will include the encryption byte for text frames.

Frames not included in the stream can also safely be accessed. When the frame is not in the stream you will get a empty string in case of a text frame or an empty data property.

##Version 0.1.0
Only reads version (2).3.0 tags. It will emit a id3v2.constants.events.TAG_ERROR with 'This feature is not yet implemented.' for for version (2).2.0 and (2).4.0. The 'This feature is not yet implemented.' constants.events.TAG_ERROR will also be emitted for some features like a tag with the compression flag set.