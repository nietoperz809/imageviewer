var express = require('express');
var fs = require('fs');
var path = require('path');
//var crypto = require('crypto');
//var os = require('os');
var app = express();
var mustache = require('mustache');
var template = fs.readFileSync(__dirname + '\\template.html').toString();
var getPayload = require(__dirname + '\\get_payload');

mustache.parse(template);

///////////////////////////////////////////////////////////

function Stack() {

    var items = [];

    this.push = function(element){
        items.push(element);
    };

    this.pop = function(){
        return items.pop();
    };

    this.peek = function(){
        return items[items.length-1];
    };

    this.isEmpty = function(){
        return items.length === 0;
    };

    this.size = function(){
        return items.length;
    };

    this.clear = function(){
        items = [];
    };

    this.print = function(){
        console.log(items.toString());
    };
}

var stack = new Stack();

///////////////////////////////////////////////////////////

var rootDir = 'C:\\Users\\Administrator\\Desktop\\fick';

var paths = {
    photos: rootDir,
    previews: null,
    thumbs: null,
};

var options = {
     title: 'My Awesome Photo Gallery'
};

function getDirs(srcpath)
{
    return fs.readdirSync(srcpath).filter(function(file)
    {
        return fs.statSync(path.join(srcpath, file)).isDirectory();
    });
}

// Number.prototype.pad = function(size)
// {
//     var s = String(this);
//     while (s.length < (size || 2)) {s = "0" + s;}
//     return s;
// }

app.get('/', function(req, res)
{
    res.sendFile('frameset.html', {root: __dirname })
});

app.all('*', function(req, res, next)
{
    var url = req.url;
    var ext = path.extname(url);
    if (ext === '.css' || ext === '.js')
        res.sendFile(url.substring(1), {root: __dirname })
    else if (ext === '.jpg')
    {
        var file = path.basename(url);
        res.sendFile(file, {root: rootDir })
    }
    else
        next();
});

// app.all('*', function (req, res, next)
// {
//     var url = req.url;
//     //console.log(url);
//     //res.sendFile(url.substring(1), {root: __dirname })
//     next(); // pass control to the next handler
// });


app.get('/view.html', function(req, res)
{
    paths.photos = rootDir;
    getPayload(paths, options, function(payload)
    {
        console.log ('build view')
        res.send(mustache.render(template, {
            title: options.title || 'Photo Gallery',
            data: JSON.stringify(payload)
        }));
    });
});

app.get ('/back', function(req, res)
{
    if (stack.isEmpty() === false)
    {
        rootDir = stack.pop();
    }
    res.redirect('/nav.html');
});

app.get ('/hsh*', function(req, res)
{
    var dec = decodeURIComponent(req.url.substring(4));
    //console.log('hit:'+dec);
    stack.push(rootDir);
    rootDir = rootDir+"\\"+dec;

    //app.del('/view.html');
    //app = express();
    //app.use('/view.html', gall(req, res));
    //app.listen(80);
    
    res.redirect('/nav.html');
});

app.get('/nav.html', function(req, res)
{
    var dirs = getDirs(rootDir);
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
    var out = header + rootDir + '<hr><a href=\"'+'back'+'\">BACK</a></br>';
    dirs.forEach(function(entry)
    {
        var escaped_str = require('querystring').escape(entry);
        //var escaped_str = crypto.createHash('md5').update(entry).digest('hex');;
        out = out + '<a href=\"hsh'+escaped_str+'\">'+entry+'</a>'+ '</br>'
    });
    res.send(out+'</html>');
});

app.listen(80);


