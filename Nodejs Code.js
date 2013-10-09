function initGET(req, pre, cb) {
pre._GET = {};
var urlparts = req.url.split('?');
if (urlparts.length >= 2) {
var query = urlparts[urlparts.length-1].split('&');
for (var p=0; p < query.length; ++p) {
var pair = query[p].split('=');
pre._GET[pair[0]] = pair[1];
}
}
cb();
}

To initialize the Node.js pre._GET variable, a modification will need to be made to the
Node.js exports.serve() function. Here’s the original exports.serve() function:

exports.serve = function(req, res) {
res.writeHead(200, {'Content-Type': 'text/plain'});
res.end('admin/index.njs');
};

Instead of implementing the actual page in the exports.serve() function, a new function
called page() will actually implement the page and the exports.serve() function
will be reserved for the initialization and other work that the PHP engine would provide
to a PHP page:

function page(req, res, pre, cb) {
res.writeHead(200, {'Content-Type': 'text/plain'});
res.end('admin/index.njs');
cb();
}

For debugging purposes, it can be helpful to print out the pre object. By using the
require() function to load the built-in module called util and then adding a util
.inspect() function call to the res.end() function call, the contents of the pre variable,
including the contents of its _GET property, will be shown in the HTTP response:

var util = require('util');
function page(req, res, pre, cb) {
res.writeHead(200, {'Content-Type': 'text/plain'});
res.end('admin/index.njs\n'+util.inspect(pre));
cb();
}

Now that handling the page has moved to the page() function, the exports.serve()
function will be changed to do an initialization, including calling the initGET()
function:
exports.serve = function(req, res) {
var pre = {};
initGET(req, pre, function() {
page(req, res, pre, function() {
});
});
};

The pre variable is created first. Then the initGET() function is called, and when it is
finished, the page() function is called. There is no finalization or cleanup after the
page() function, so its callback is empty.
Now that the _GET property is implemented, the page() function can be changed to use
query arguments. The page() function can be modified to expect an x query argument
and respond appropriately:

function page(req, res, pre, cb) {
res.writeHead(200, {'Content-Type': 'text/plain'});
if (pre._GET['x']) {
res.end('The value of x is '+pre._GET['x']+'.');
} else {
res.end('There is no value for x.');
}
cb();
}


Putting the code all together, the initPOST() function is shown here in its entirety:
function initPOST(req, pre, cb) {
pre._POST = {};
var body = '';
req.on('data', function(chunk) {
body += chunk;
if (body.length > 1e6) {
req.connection.destroy();
}
});
req.on('end', function() {
var pairs = body.split('&');
for (var p=0; p < pairs.length; ++p) {
var pair = pairs[p].split('=');
pre._POST[pair[0]] = pair[1];
}
cb();
});
}

Just like pages that expect HTTP GET requests, the exports.serve() function must be
updated. For pages that expect HTTP POST requests, the code in the exports
.serve() function is almost identical, except that the initGET() function call is replaced
with an initPOST() function call. This is by design. Even though the initGET() function
does not need a callback, giving it a callback allows the initGET() function and the
initPOST() function to take the same parameters and has almost the same code:
exports.serve = function(req, res) {
var pre = {};
initPOST(req, pre, function() {
page(req, res, pre, function() {
});
});
};

function initCOOKIE(req, pre, cb) {
pre._COOKIE = {};
if (req.headers.cookie) {
var cookies = req.headers.cookie.split(';');
for (var c=0; c < cookies.length; ++c) {
var pair = cookies[c].split('=');pre._COOKIE[pair[0]] = pair[1];
}
}
cb();
}

Just like pages that expect HTTP GET and HTTP POST requests, pages that expect
cookies will modify their exports.serve() function to call the initCOOKIE() function.
The initCOOKIE() function has the same parameters as both the initGET() function
and the initPOST() function so the same code can be used by calling the init
COOKIE() function instead of those other functions:
exports.serve = function(req, res) {
var pre = {};
initCOOKIE(req, pre, function() {
page(req, res, pre, function() {
});
});
};

A particular page handles both HTTP GET and HTTP POST requests as well as uses
cookies. The exports.serve() function for that page can be enhanced to invoke the
needed initialization functions by putting one function inside the callback of another
function. This code will load the pre._GET, pre._POST, and pre._COOKIE properties,
which will be substitutes for the PHP predefined variables, $_GET, $_POST, and $_COOKIE:
exports.serve = function(req, res) {
var pre = {};
initGET(req, pre, function() {
initPOST(req, pre, function() {
initCOOKIE(req, pre, function() {
page(req, res, pre, function() {
});
});
});
});
};

exports.serve = function(req, res) {
var pre = {};
initGET(req, pre, function() {
initPOST(req, pre, function() {
initCOOKIE(req, pre, function() {
initREQUEST(req, pre, function() {
page(req, res, pre, function() {
});
});
});
});
});
};

/** All the sessions of all the users. */
var sessions = {};
function initSESSION(req, pre, cb) {
if ((typeof pre._COOKIE['NODESESSID']) == 'undefined') {
var pool = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
var newid = '';
for (var i = 0; i < 26; ++i) {
var r = Math.floor(Math.random() * pool.length);
newid += pool.charAt(r);
}
pre._COOKIE['NODESESSID'] = newid;
sessions[pre._COOKIE['NODESESSID']] = {};
}
var id = pre._COOKIE['NODESESSID'];
if ((typeof sessions[id]) == 'undefined') {
sessions[id] = {};
}
pre._SESSION = sessions[id];
cb();
}

A particular page must be made to handle sessions as well. The exports.serve()
function for that page can be enhanced to invoke the needed initialization functions by
putting one function inside the callback of another function. The following code will
load the pre._GET, pre._POST, pre._COOKIE, and pre._REQUEST properties,
which will be substitutes for the PHP predefined variables, $_GET, $_POST, $_COOKIE, and
$_REQUEST.
The initSESSION() function is the final initialization function called in the exports
.serve() function. It relies on the $_COOKIE PHP variable to maintain the session. To
keep the cookie active, the callback function of the page() function is updated to return
the cookie to the caller:
exports.serve = function(req, res) {
var pre = {};
initGET(req, pre, function() {
initPOST(req, pre, function() {
initCOOKIE(req, pre, function() {
initREQUEST(req, pre, function() {
initSESSION(req, pre, function() {page(req, res, pre, function() {
var cookies = [];
for ( var c in pre._COOKIE) {
cookies.push(c + '=' + pre._COOKIE[c]);
}
res.setHeader('Set-Cookie', cookies);
res.writeHead(200, {'Content-Type': 'text/plain'});
res.end(res.content);
});
});
});
});
});
});
};


Instead of copying and pasting the initGET(), initPOST(), initCOOKIE(), init
REQUEST(), and initSESSION functions into every local module, an initreq.njs local
module can be created to share these functions with all the local modules. To make them
available to callers that load the local module, they are assigned as properties to the
exports variable:
exports.initGET = function(req, pre, cb) {
pre._GET = {};
var urlparts = req.url.split('?');
if (urlparts.length >= 2) {
var query = urlparts[urlparts.length-1].split('&');
for (var p=0; p < query.length; ++p) {
var pair = query[p].split('=');
pre._GET[pair[0]] = pair[1];
}
}
cb();
};
exports.initPOST = function(req, pre, cb) {
pre._POST = {};
var body = '';
req.on('data', function(chunk) {
body += chunk;
if (body.length > 1e6) {
req.connection.destroy();
}
});
req.on('end', function() {
var pairs = body.split('&');
for (var p=0; p < pairs.length; ++p) {
var pair = pairs[p].split('=');
pre._POST[pair[0]] = pair[1];}
cb();
});
};
exports.initCOOKIE = function(req, pre, cb) {
pre._COOKIE = {};
if (req.headers.cookie) {
var cookies = req.headers.cookie.split(';');
for (var c=0; c < cookies.length; ++c) {
var pair = cookies[c].split('=');
pre._COOKIE[pair[0]] = pair[1];
}
}
cb();
};
exports.initREQUEST = function(req, pre, cb) {
pre._REQUEST = {};
if (pre._GET) {
for (var k in pre._GET) {
pre._REQUEST[k] = pre._GET[k];
}
}
if (pre._POST) {
for (var k in pre._POST) {
pre._REQUEST[k] = pre._POST[k];
}
}
if (pre._COOKIE) {
for (var k in pre._COOKIE) {
pre._REQUEST[k] = pre._COOKIE[k];
}
}
cb();
};
/** All the sessions of all the users. */
var sessions = {};
exports.initSESSION = function(req, pre, cb) {
if ((typeof pre._COOKIE['NODESESSID']) == 'undefined') {
var pool = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
var newid = '';
for (var i = 0; i < 26; ++i) {
var r = Math.floor(Math.random() * pool.length);
newid += pool.charAt(r);
}
pre._COOKIE['NODESESSID'] = newid;
sessions[pre._COOKIE['NODESESSID']] = {};
}
var id = pre._COOKIE['NODESESSID'];if ((typeof sessions[id]) == 'undefined') {
sessions[id] = {};
}
pre._SESSION = sessions[id];
cb();
}

var initreq = require('./initreq.njs');
exports.serve = function(req, res) {
var pre = {};
initreq.initGET(req, pre, function() {
initreq.initPOST(req, pre, function() {
initreq.initCOOKIE(req, pre, function() {
initreq.initREQUEST(req, pre, function() {
initreq.initSESSION(req, pre, function() {
page(req, res, pre, function() {
var cookies = [];
for ( var c in pre._COOKIE) {
cookies.push(c + '=' + pre._COOKIE[c]);
}
res.setHeader('Set-Cookie', cookies);
res.writeHead(200, {'Content-Type': 'text/plain'});
res.end(res.content);
});
});
});
});
});
});
};

For each PHP page, an index.njs file or other local module file will be created. The
exports.serve() function will be the Node.js stand-in for the page handling code in
the PHP engine for this specific page. If additional predefined variables, initialization
code, or finalization code (i.e., code that needs to be run after the page completes) is
needed, the exports.serve() function can be modified. The exports.serve() function
is not the page itself; it is the code that “wraps” around the page:
var initreq = require('./initreq.njs');
exports.serve = function(req, res) {
var pre = {};
initGET(req, pre, function() {
initPOST(req, pre, function() {
initCOOKIE(req, pre, function() {
initREQUEST(req, pre, function() {
initSESSION(req, pre, function() {
page(req, res, pre, function() {
var cookies = [];
for ( var c in pre._COOKIE) {
cookies.push(c + '=' + pre._COOKIE[c]);
}
res.setHeader('Set-Cookie', cookies);
res.writeHead(200, {'Content-Type': 'text/plain'});
res.end(res.content);
});
});
});
});
});
});
};
function page(req, res, pre, cb) {res.writeHead(200, {'Content-Type': 'text/plain'});
res.end('admin/index.njs\n'+util.inspect(pre));
cb();
}

code mixed with some HTML:
<?php
$x = $_REQUEST['x'];
$x += 5;
?>
<html><head></head><body>
The value of x plus 5 is <?php echo $x; ?>.
</body></html>
The PHP code will first be copied and pasted into the page() function, yielding weird
looking, nonfunctional PHP/Node.js hybrid code:
function page(req, res, pre, cb) {
var content = '';
<?php
$x = $_REQUEST['x'];
$x += 5;
?>
<html><head></head><body>
The value of x plus 5 is <?php echo $x; ?>.
</body></html>
res.writeHead(200, {'Content-Type': 'text/html'})
res.end(content);
cb();
}
Next, the first block of PHP code will be converted. Here’s the snippet before conversion:
<?php
$x = $_REQUEST['x'];
$x += 5;
?>
After conversion, it still looks very similar, except now it is Node.js code:
var x = parseInt(pre._REQUEST['x']);
x += 5;
Then, the remaining HTML code is converted:
<html><head></head><body>
The value of x plus 5 is <?php echo $x; ?>.
</body></html>
Its Node.js equivalent is very similar to its PHP counterpart, too:
content += '<html><head></head><body>';
content += 'The value of x plus 5 is '+x+'.';
content += '</body></html>';
And here’s the fully converted page() function in the showx5.njs file that implements
the Node.js equivalent of showx5.php:
function page(req, res, pre, cb) {
var content = '';
var x = parseInt(pre._REQUEST['x']);
x += 5;
content += '<html><head></head><body>';
content += 'The value of x plus 5 is '+x+'.';
content += '</body></html>';
res.writeHead(200, {'Content-Type': 'text/html'})
res.end(content);
cb();
}

And the complete showx5.njs file:
var initreq = require('./initreq.njs');
exports.serve = function(req, res) {
var pre = {};
    initreq.initGET(req, pre, function() {
        initreq.initPOST(req, pre, function() {
            initreq.initCOOKIE(req, pre, function() {
                initreq.initREQUEST(req, pre, function() {
                    initreq.initSESSION(req, pre, function() {
                        page(req, res, pre, function() {
                            var cookies = [];
                            for ( var c in pre._COOKIE) {
                                cookies.push(c + '=' + pre._COOKIE[c]);
                            }
                            res.setHeader('Set-Cookie', cookies);
                            res.writeHead(200, {'Content-Type': 'text/plain'});
                            res.end(res.content);
                        });
                    });
                });
            });
        });
    });
};

function page(req, res, pre, cb) {
    var content = '';
    var x = parseInt(pre._REQUEST['x']);
    x += 5;
    content += '<html><head></head><body>';
    content += 'The value of x plus 5 is '+x+'.';
    content += '</body></html>';
    res.writeHead(200, {'Content-Type': 'text/html'})
    res.end(content);
    cb();
}

The httpsvr.njs file is modified to route the showx5.php URL to the showx5.njs local
module:
var http = require('http');
var static = require('node-static');
var file = new static.Server();
var url = require('url');
var showx5 = require('./showx5.njs');
http.createServer(function (req, res) {
    if (url.parse(req.url).pathname == '/showx5.php') {
        showx5.serve(req, res);
    } else {
        file.serve(req, res);
    }
}).listen(1337, '127.0.0.1');
console.log('Server running at http://127.0.0.1:1337/');

If you put the httpsvr.njs, initreq.njs, and showx5.njs files in the same directory and run
the Node.js server, both the PHP and Node.js code will perform the same. Using a client
such as a web browser to visit the following URLs will show the same result:
http://localhost/showx5.php?x=22
http://localhost:1337/showx5.php?x=22
The first URL will go to the PHP web server.The second URL will go to its equivalent
Node.js web server