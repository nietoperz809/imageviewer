const sam = require('./sam');

var AudioContext = require('web-audio-api').AudioContext
    , context = new AudioContext
    , Speaker = require('speaker')

context.outStream = new Speaker({
    channels: 1,
    bitDepth: 16,
    sampleRate: 44100
})

let input = "hello sam";
let ptr = sam.allocate(sam.intArrayFromString(input), 'i8', 1);

sam._TextToPhonemes(ptr);
sam._SetInput(ptr);
sam._Code39771();

let bufferlength = Math.floor(sam._GetBufferLength()/50);
let bufferptr = sam._GetBuffer();

audiobuffer = new Float32Array(bufferlength);
for(let i=0; i<bufferlength; i++)
    audiobuffer[i] = ((sam.getValue(bufferptr+i, 'i8')&0xFF)-128)/256;

var source = context.createBufferSource();

// var buffer = baseAudioContext.createBuffer(numOfchannels, length, sampleRate);
var soundBuffer = context.createBuffer(1, audiobuffer.length, 44100);

var buffer = soundBuffer.getChannelData(0);
for(var i=0; i<audiobuffer.length; i++)
    buffer[i] = audiobuffer[i];
source.buffer = soundBuffer;
source.connect(context.destination);
source.start(0);

/*

 function Speak(text)
 {
 var input = text;
 while (input.length < 256) input += " ";
 var ptr = allocate(intArrayFromString(input), 'i8', ALLOC_STACK);
 _TextToPhonemes(ptr);
 _SetInput(ptr);
 _Code39771();
 var bufferlength = Math.floor(_GetBufferLength()/50);
 var bufferptr = _GetBuffer();
 audiobuffer = new Float32Array(bufferlength);
 for(var i=0; i<bufferlength; i++)
 audiobuffer[i] = ((getValue(bufferptr+i, 'i8')&0xFF)-128)/256;
 //PlayBuffer(audiobuffer);
 //PlayWebkit(new AudioContext(), audiobuffer);
 var context = new AudioContext();
 var source = context.createBufferSource();

 // var buffer = baseAudioContext.createBuffer(numOfchannels, length, sampleRate);
 var soundBuffer = context.createBuffer(1, audiobuffer.length, 22050);

 var buffer = soundBuffer.getChannelData(0);
 for(var i=0; i<audiobuffer.length; i++) buffer[i] = audiobuffer[i];
 source.buffer = soundBuffer;
 source.connect(context.destination);
 source.start(0);
 }

 */
