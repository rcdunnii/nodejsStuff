 var http = require('http');
 var static = require('node-static');
 var file = new static.Server();
 var url = require('url');
 var secureimageShow = require('./secureimage/secureimage_show.njs');
 var secureimagePlay = require('./secureimage/secureimage_play.njs');
 var admin_index = require('./addNut.njs');

 http.createServer(function(req, res) {
    if (url.parse(req.url).pathname == 'secureimage/secureimage_show.php') {
        secureimageShow.serve(req, res);
    } else if (url.parse(req.url).pathname == 'secureimage/secureimage_play.php') {
        secureimagePlay.serve(req, res);
    } else if (url.parse(req.url).pathname == 'addNut.php') {
        admin_index.serve(req, res);
    } else {
        file.serve(req, res);
    }
 }).listen(1337, '127.0.0.1');
 console.log('Server running at http://127.0.0.1:1337/');
 
 exports.serve = function(req, res) {
			res.writeHead(200, {'Content-Type' : 'text-plain'});
            res.write(req);
			res.end();
		};
