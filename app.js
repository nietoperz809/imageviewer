var express = require('express');
var fs = require('fs');
var path = require('path');
var app = express();
var mustache = require('mustache');
var urlparser = require('url');
var template = fs.readFileSync(__dirname + '\\res\\template.html').toString();
var getPayload = require(__dirname + '\\res\\get_payload');

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

var paths = {
    photos: 'C:\\Users\\Administrator\\Desktop\\fick',
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

function urldecode(url)
{
    return decodeURIComponent(url.replace(/\+/g, ' '));
}

app.get('/', function(req, res)
{
    res.sendFile('res\\frameset.html', {root: __dirname })
});

app.all('*', function(req, res, next)
{
    var pathname = urldecode(urlparser.parse(req.url, true).pathname);
    var ext = path.extname(pathname).toUpperCase();
    var file = path.basename(pathname);
    //console.log(file);
    if (ext === '.CSS' ||
        ext === '.JS' ||
        ext === '.WOFF' ||
        ext === '.TTF')
        res.sendFile(file, {root: 'res' })
    else if (ext === '.JPG')
    {
        res.sendFile(file, {root: paths.photos })
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
    getPayload(paths, options, function(payload)
    {
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
        paths.photos = stack.pop();
    }
    res.redirect('/nav.html');
});

app.get ('/hsh*', function(req, res)
{
    var dec = decodeURIComponent(req.url.substring(4));
    //console.log('hit:'+dec);
    stack.push(paths.photos);
    paths.photos = paths.photos+"\\"+dec;

    //app.del('/view.html');
    //app = express();
    //app.use('/view.html', gall(req, res));
    //app.listen(80);
    
    res.redirect('/nav.html');
});

app.get('/nav.html', function(req, res)
{
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
        //var escaped_str = crypto.createHash('md5').update(entry).digest('hex');;
        out = out + '<a href=\"hsh'+escaped_str+'\">'+entry+'</a>'+ '</br>'
    });
    res.send(out+'</html>');
});

app.listen(80);


