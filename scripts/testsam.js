const sam = require('./sam');

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
