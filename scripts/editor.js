'use strict';

const basic = require ("./basic");
const syncinput = require ("./syncinput");
const fs = require ('fs');
const robot = require ("robotjs");
const path = require ('path');

let program = [];

let interpreter = new basic.Interpreter ();
interpreter.print_function = myprint;
interpreter.string_input_function = myTextInput;
interpreter.number_input_function = myNumberInput;
interpreter.clear_function = myClear;

function myTextInput (p)
{
    return syncinput.getKeyInput ().replace (/\n$/, '');
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
    try
    {
        let txt = progToString ();
        let p = new basic.Parser (txt);
        p.parse ();
        interpreter.setParser (p);
        interpreter.interpret ();
        return true;
    }
    catch (e)
    {
        console.log (e);
        return false;
    }
}

function immediate (txt)
{
    try
    {
        let p = new basic.Parser ('1 ' + txt);
        p.parse ();
        interpreter.setParser (p);
        interpreter.interpret ();
        return true;
    }
    catch (e)
    {
        console.log (e);
        return false;
    }
}

function progToString ()
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
        let x = progToString ();
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

function dir (srcPath)
{
    console.log ("DIR of: "+path.resolve(srcPath));
    fs.readdirSync (srcPath).forEach (function (file)
    {
        try
        {
            let stat = fs.statSync (srcPath + '//' + file);
            file = file.padEnd(20, ' ');
            if (stat.isDirectory())
            {
                console.log (file + '<DIR>');
            }
            else
            {
                console.log (file + stat.size);
            }
        }
        catch (e)
        {
        }
    });
}

function renumber (args)
{
    let renMap = [];
    let start = Number (args[1] || 10);
    let step = Number (args[2] || 10);

    for (let i = 0; i < program.length; i++)
    {
        renMap.push ({old: program[i].n, new: start});
        program[i].n = start;
        start += step;
    }
    // Pass 2
    for (let i = 0; i < program.length; i++)
    {
        let linesplit = program[i].t.split (" ");
        for (let s=0; s<linesplit.length; s++)
        {
            if (typeof linesplit[s] !== 'string')
                continue;
            let w = linesplit[s].toUpperCase();
            if (w === 'GOTO' || w === 'GOSUB')
            {
                let num = linesplit[s+1];
                for (let p=0; p<renMap.length; p++)
                {
                    if (renMap[p].old === num)
                    {
                        linesplit[s+1] = renMap[p].new;
                    }
                }
            }
        }
        program[i].t = linesplit.join(' ');
    }
}

function list (fromto)
{
    fromto.shift ();
    fromto = fromto.join ('');
    let start = 0;
    let end = Infinity;
    if (fromto !== "")
    {
        let ft = fromto.split ("-");
        if (ft[1] === undefined)
        {
            start = ft[0];
            end = ft[0];
        }
        else if (ft[0] === "")
        {
            end = ft[1];
        }
        else if (ft[1] === "")
        {
            start = ft[0];
        }
        else
        {
            start = ft[0];
            end = ft[1];
        }
    }
    //console.log (start + ' --- ' + end);
    for (let i = 0; i < program.length; i++)
    {
        let lnum = program[i].n;
        if (lnum >= Number (start) && lnum <= Number (end))
            console.log (lnum + ' ' + program[i].t);
    }
}

function rawInput (line)
{
    let match = line.match ('^[0-9]+');
    if (match)
    {
        let num = match[0];
        let txt = line.substring (num.length).trim ();
        basicLineInput (num, txt);
        return true;
    }
    else
        return immediate (line);
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

function basicLineInput (num, txt)
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

function edit (num)
{
    let line = "";
    for (let i = 0; i < program.length; i++)
    {
        if (program[i].n === num)
        {
            line = program[i].n + ' ' + program[i].t;
            break;
        }
    }
    if (line === "")
        return false;
    robot.typeString (line);
    let cmd = syncinput.getKeyInput ().trim ();
    return rawInput (cmd);
}

//////////////////////////////////////////////////////////

process.stdout.write ("*** Node BASIC ***");
while (1)
{
    process.stdout.write ('\n>');
    let cmd = syncinput.getKeyInput ().trim ();
    let sp = cmd.split (" ");
    let res = true;
    switch (sp[0].toUpperCase ())
    {
        case "RENUMBER":
            renumber (sp);
            break;
        case "LIST":
            list (sp);
            break;
        case "DIR":
            dir (sp[1] || __dirname);
            break;
        case "EDIT":
            res = edit (sp[1]);
            break;
        case "SAVE":
            save (sp[1]);
            break;
        case "LOAD":
            program = [];
            load (sp[1]);
            break;
        case "NEW":
            program = [];
            break;
        case "RUN":
            res = basicRun ();
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

