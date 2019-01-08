const sam = require('./sam');

let count = 0;

function intervalFunc()
{
    let jss = new sam.SamJS();
    jss.playSam('hello world');
    process.stdout.write("Tick: "+count+'\n');
    count++;
}

setInterval(intervalFunc, 2000);


