/*
 * Uses ID3V2 an example mp3 file which only contains tag data and no music.
 * @type {exports|module.exports}
 */

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
