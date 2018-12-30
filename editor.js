'use strict';

const wait = require ('wait-for-stuff');
const basic = require ("./basic");
const fs = require ('fs');

let keyInput = ""

function keyPress ()
{
    return new Promise ((resolve, reject) =>
    {
        process.stdin.once ('data', function(key)
        {
            keyInput = key.toString();
            return resolve ();
        });
    })
}

function getKeyInput()
{
    let p = keyPress();
    wait.for.promise (p);
    return keyInput;
}

let program = [];

let interpreter = new basic.Interpreter ();

function myTextInput (p)
{
    return getKeyInput().replace(/\n$/, '');
}

function myprint (text, eol)
{
    if (text)
    {
        process.stdout.write (text);
        if (eol)
            process.stdout.write ('\n');
    }
}

function basicRun ()
{
    let txt = toPlainString ();
    let p = new basic.Parser (txt);
    p.parse ();
    interpreter.setParser (p);
    interpreter.print_function = myprint;
    interpreter.string_input_function = myTextInput;
    interpreter.interpret ();
}

main ();

function main ()
{
    let running = false;
    while (1)
    {
        if (running === false)
        {
            process.stdout.write('\n>');
            let cmd = getKeyInput().trim();
            let sp = cmd.split (" ");
            switch (sp[0].toUpperCase ())
            {
                case "LIST":
                    list ();
                    break;
                case "SAVE":
                    save (sp[1]);
                    break;
                case "LOAD":
                    load (sp[1]);
                    break;
                case "NEW":
                    program = [];
                    break;
                case "RUN":
                    running = true;
                    basicRun ();
                    running = false;
                    break;
                default:
                    rawInput (cmd.toUpperCase ());
                    break;
            }
        }
    }
}

function toPlainString ()
{
    let out = "\n";
    for (let i = 0; i < program.length; i++)
    {
        out = out + program[i].n + ' ' + program[i].t + '\n';
    }
    return out;
}

function save (filename)
{
    try
    {
        let x = toPlainString ();
        fs.writeFileSync (filename, x);
    }
    catch (e)
    {
        console.error ("Cannot save " + filename);
    }
}

function load (filename)
{
    try
    {
        let rawdata = fs.readFileSync (filename).toString ();
        //console.log (rawdata);
        let sp = rawdata.split ("\n");
        //console.log(sp);
        for (let s = 0; s < sp.length; s++)
        {
            if (sp[s])
                rawInput (sp[s]);
        }
    }
    catch (e)
    {
        console.error ("Cannot load " + filename);
    }
}

function list ()
{
    for (let i = 0; i < program.length; i++)
    {
        console.log (program[i].n + ' ' + program[i].t);
    }
}

function rawInput (line)
{
    //console.log (line);
    let match = line.match ('^[0-9]+');
    if (match)
    {
        let num = match[0];
        let txt = line.substring (num.length).trim ();
        lineInput (num, txt);
    }
}

function deleteLine (num)
{
    for (let i = 0; i < program.length; i++)
    {
        if (program[i].n === num)
        {
            program.splice (i, 1);
            return;
        }
    }
}

function lineInput (num, txt)
{
    deleteLine (num);
    if (txt)
    {
        let line = {n: num, t: txt};
        program.push (line);
        program = program.sort (function (a, b)
        {
            return Number (a.n) > Number (b.n);
        });
    }
}

