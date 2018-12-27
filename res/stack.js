// Stack module

var items = [];

exports.getItems = function()
{
    return JSON.stringify(items);
}

exports.setItems = function(jstr)
{
    var arr = JSON.parse(jstr);
    items = arr.slice();
}

exports.push = function (element) {
    items.push(element);
};

exports.pop = function () {
    return items.pop();
};

exports.peek = function () {
    return items[items.length - 1];
};

exports.isEmpty = function () {
    return items.length === 0;
};

exports.size = function () {
    return items.length;
};

exports.clear = function () {
    items = [];
};

exports.print = function () {
    console.log(items.toString());
};
