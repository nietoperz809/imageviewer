const wait = require ('wait-for-stuff');

let keyInput = ""

function keyPress ()
{
    return new Promise ((resolve, reject) =>
    {
        process.stdin.once ('data', function (key)
        {
            keyInput = key.toString ();
            return resolve ();
        });
    })
}

function getKeyInput ()
{
    let p = keyPress ();
    wait.for.promise (p);
    return keyInput;
}

module.exports.getKeyInput = getKeyInput;

