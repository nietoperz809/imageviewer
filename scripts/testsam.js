const sam = require('./sam');
const wait = require ('wait-for-stuff');
const events = require('events');

const AudioContext = require('web-audio-api').AudioContext
    , context = new AudioContext
    , Speaker = require('speaker')

context.outStream = new Speaker({
    channels: 1,
    bitDepth: 16,
    sampleRate: 44100
})

const eventEmitter = new events.EventEmitter();

function playSam (speech)
{
    let ret = sam.intArrayFromString (speech);
    console.log (ret);
    let ptr = sam.allocate (ret, 'i8', 1, 0);
    console.log (ptr);

    sam._TextToPhonemes (ptr);
    sam._SetInput (ptr);
    sam._Code39771 ();  // init function

    let bufferlength = Math.floor (sam._GetBufferLength () / 50);
    let bufferptr = sam._GetBuffer ();

    var source = context.createBufferSource ();

    var soundBuffer = context.createBuffer (1, bufferlength, 44100);

    var buffer = soundBuffer.getChannelData (0);
    for (var i = 0; i < bufferlength; i++)
        buffer[i] = ((sam.getValue (bufferptr + i, 'i8') & 0xFF) - 128) / 256;

    source.buffer = soundBuffer;
    source.onended = function (event)
    {
        eventEmitter.emit('scream');
    }
    source.connect (context.destination);
    source.start (0);
}

for (let s=0; s<10; s++)
{
    console.log ("start");
    playSam ("hello Sam");
    let eventData = wait.for.event (eventEmitter, 'scream');
    console.log ("ready");
}

