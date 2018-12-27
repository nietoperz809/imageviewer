var express = require('express');
var fs = require('fs');
var path = require('path');
var app = express();
var mustache = require('mustache');
var urlParser = require('url');
var template = fs.readFileSync(__dirname + '\\res\\template.html').toString();
var getPayload = require(__dirname + '\\res\\get_payload');
var stack = require(__dirname + '\\res\\stack');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var uuidv4 = require('uuid/v4');

app.use(cookieParser());
app.use(session({
    secret : 'yourSecret',
    resave : false,
    saveUninitialized : true,
}));

mustache.parse(template);

var paths = {
    photos: process.argv[2],
    previews: null,
    thumbs: null,
};

console.log ('root dir: '+process.argv[2]);

var options = {
     title: 'My Awesome Photo Gallery'
};

function getDirs(srcpath)
{
    var dirs = [];
    fs.readdirSync(srcpath).forEach(function(file)
    {
        try
        {
            var stat = fs.statSync(paths.photos + '\\' + file);
            if (stat.isDirectory())
            {
                dirs.push(file);
            }
        }
        catch (e)
        {
            //console.log ('cant access: '+file)
        }
    });
    return dirs;
}

function urldecode(url)
{
    return decodeURIComponent(url.replace(/\+/g, ' '));
}

app.get('/', function(req, res)
{
    saveSession(req);
    res.sendFile('res\\frameset.html', {root: __dirname });
});

app.all('*', function(req, res, next)
{
    var pathname = urldecode(urlParser.parse(req.url, true).pathname);
    //var ext = path.extname(pathname).toUpperCase();
    var file = path.basename(pathname);

    if (fs.existsSync('res\\'+file))
        res.sendFile(file, {root: 'res' });
    else if (fs.existsSync(paths.photos+'\\'+file))
        res.sendFile(file, {root: paths.photos });
    else
    {
        //console.log('not found: '+file);
        next();
    }
});

app.get('/view.html', function(req, res)
{
    getPayload(paths, options, function(payload)
    {
        res.send(mustache.render(template, {
            title: options.title || 'Photo Gallery',
            data: JSON.stringify(payload)
        }));
    });
});


function loadSession(req)
{
    if(req.session.phot)
    {
        paths.photos = req.session.phot;
    }
    if(req.session.fuck)
    {
        stack.setItems(req.session.fuck);
    }
}

function saveSession (req)
{
    req.session.fuck = stack.getItems();
    req.session.phot = paths.photos;
}

app.get ('/back', function(req, res)
{
    loadSession(req);
    if (stack.isEmpty() === false)
    {
        paths.photos = stack.pop();
        saveSession(req);
    }
    res.redirect('/nav.html');
});

app.get ('/hsh*', function(req, res)
{
    loadSession(req);
    var dec = decodeURIComponent(req.url.substring(4));
    stack.push(paths.photos);
    paths.photos = paths.photos+"\\"+dec;
    saveSession(req);
    res.redirect('/nav.html');
});

app.get('/nav.html', function(req, res)
{
    loadSession(req);
    var dirs = getDirs(paths.photos);
    var header = '<!DOCTYPE html>\n' +
        '<html lang="en">\n' +
        '<body onload="myFunction()">\n' +
        '<script>\n' +
        'function myFunction() {\n' +
        '  parent.inhalt.location = "/view.html";\n' +
        '}\n' +
        '</script>\n' +
        '\n' +
        '</body>';
    var out = header + paths.photos + '<hr><a href=\"'+'back'+'\">BACK</a></br>';
    dirs.forEach(function(entry)
    {
        var escaped_str = require('querystring').escape(entry);
        out = out + '<a href=\"hsh'+escaped_str+'\">'+entry+'</a>'+ '</br>'
    });
    res.send(out+'</html>');
});

app.listen(80);


