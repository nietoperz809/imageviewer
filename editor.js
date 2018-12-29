'use strict';

const basic = require ("./basic");

const fs = require ('fs');
const readline = require ('readline');

const rl = readline.createInterface (
    {
        input: process.stdin,
        output: process.stdout,
        prompt: '\nReady.\n> '
    });

let program = [];

rl.prompt ();

function myinput(p)
{
    return readlineSync.question('?');
}

function myprint(text, eol)
{
    process.stdout.write(text);
    if (eol)
        process.stdout.write('\n');
}

rl.on ('line', (line) =>
{
    let cmd = line.trim ();
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
            let txt = toPlainString();
            let p = new basic.Parser(txt);
            p.parse();
            let i = new basic.Interpreter(p);
            i.print_function = myprint;
            i.string_input_function = myinput;
            i.interpret();
            break;
        default:
            rawInput (cmd.toUpperCase());
            break;
    }
    rl.prompt ();
});

function toPlainString()
{
    let out = "\n";
    for (let i = 0; i < program.length; i++)
    {
        out = out + program[i].n+' '+program[i].t+'\n';
    }
    return out;
}

function save (filename)
{
    try
    {
        let x = toPlainString();
        fs.writeFileSync (filename, x);
    }
    catch (e)
    {
        console.error("Cannot save "+filename);
    }
}

function load (filename)
{
    try
    {
        let rawdata = fs.readFileSync (filename).toString();
        //console.log (rawdata);
        let sp = rawdata.split("\n");
        //console.log(sp);
        for (let s=0; s<sp.length; s++)
        {
            if (sp[s])
                rawInput(sp[s]);
        }
    }
    catch (e)
    {
        console.error("Cannot load "+filename);
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

