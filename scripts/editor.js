'use strict';

const basic = require ("./basic");
const input = require ("./syncinput");
const fs = require ('fs');

let program = [];

let interpreter = new basic.Interpreter ();

function myTextInput (p)
{
    return input.getKeyInput ().replace (/\n$/, '');
}

function myNumberInput (p)
{
    let txt = myTextInput (p);
    return parseFloat (txt);
}

function myClear ()
{
    process.stdout.write ("\u001b[2J\u001b[0;0H");
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
    interpreter.number_input_function = myNumberInput;
    interpreter.clear_function = myClear;
    interpreter.interpret ();
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
        let sp = rawdata.split ("\n");
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
    let match = line.match ('^[0-9]+');
    if (match)
    {
        let num = match[0];
        let txt = line.substring (num.length).trim ();
        lineInput (num, txt);
        return true;
    }
    return false;
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

//////////////////////////////////////////////////////////

process.stdout.write ("*** Node BASIC ***");
while (1)
{
    process.stdout.write ('\n>');
    let cmd = input.getKeyInput ().trim ();
    let sp = cmd.split (" ");
    let res = true;
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
            basicRun ();
            break;
        case "BYE":
            process.exit (0);
            break;
        case "CLS":
            myClear ();
            break;
        case "":
            break;
        default:
            res = rawInput (cmd);
            break;
    }
    if (false === res)
        process.stdout.write ('ERROR.');
    else
        process.stdout.write ('READY.');
}

