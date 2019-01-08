// const sam = require('./sam');
var fork = require('child_process').fork;

var running = false;
var count = 0;

function runChild()
{
    console.log ('starting child');
    let child = fork('./scripts/sam', ['peter ist lieb']);
    running = true;
    child.on('exit', (code) =>
    {
        console.log ('child gone');
        running = false;
    });
}

function intervalFunc()
{
    if (running === false)
        runChild();
    process.stdout.write("Tick: "+count+'\n');
    count++;
}

setInterval(intervalFunc, 500);


