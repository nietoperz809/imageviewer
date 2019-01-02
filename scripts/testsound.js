// const Speaker = require('speaker');
//
// // Create the Speaker instance
// const speaker = new Speaker({
//     channels: 2,          // 2 channels
//     bitDepth: 16,         // 16-bit samples
//     sampleRate: 44100     // 44,100 Hz sample rate
// });

/////////////////////////////////////////

const Readable = require('stream').Readable
const bufferAlloc = require('buffer-alloc')
const Speaker = require('speaker')

// the frequency to play
const freq = parseFloat(process.argv[2], 10) || 1000.0

// seconds worth of audio data to generate before emitting "end"
const duration = parseFloat(process.argv[3], 10) || 2.0

console.log('generating a %dhz sine wave for %d seconds', freq, duration)

// A SineWaveGenerator readable stream
const sine = new Readable()
sine.bitDepth = 16
sine.channels = 2
sine.sampleRate = 44100
sine.samplesGenerated = 0
sine._read = read

// create a SineWaveGenerator instance and pipe it to the speaker
sine.pipe(new Speaker())

// the Readable "_read()" callback function
function read (n) {
    const sampleSize = this.bitDepth / 8
    const blockAlign = sampleSize * this.channels
    const numSamples = n / blockAlign | 0
    const buf = bufferAlloc(numSamples * blockAlign)
    const amplitude = 32760 // Max amplitude for 16-bit audio

    // the "angle" used in the function, adjusted for the number of
    // channels and sample rate. This value is like the period of the wave.
    const t = (Math.PI * 2 * freq) / this.sampleRate

    for (let i = 0; i < numSamples; i++) {
        // fill with a simple sine wave at max amplitude
        for (let channel = 0; channel < this.channels; channel++) {
            const s = this.samplesGenerated + i
            const val = Math.round(amplitude * Math.sin(t * s)) // sine wave
            const offset = (i * sampleSize * this.channels) + (channel * sampleSize)
            buf[`writeInt${this.bitDepth}LE`](val, offset)
        }
    }

    this.push(buf)

    this.samplesGenerated += numSamples
    if (this.samplesGenerated >= this.sampleRate * duration) {
        // after generating "duration" second of audio, emit "end"
        this.push(null)
    }
}
