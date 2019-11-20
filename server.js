const http = require('http')
const url  = require('url')
const qs = require('querystring')

var g_cookies  = {}
var g_handlers = {}
var g_redirect = null

exports.on = function(method, url, handler){
	g_handlers[method.toUpperCase()+url] = handler
}

exports.getCookie = function(k){ return g_cookies[k]; }
exports.setCookie = function(k, v){
	g_cookies[k] = v
}
exports.deleteCookie = function(k){
	g_cookies[k] = null
}

exports.start = function(){
	var port = 8888
	console.log('start server on localhost:'+port)
	http.createServer(function(request, response) {

		g_cookies = {}
		var rc = request.headers.cookie;

		rc && rc.split(';').forEach(function( cookie ) {
			var parts = cookie.split('=')
			g_cookies[parts.shift().trim()] = decodeURI(parts.join('='))
		})

		var pathname = url.parse(request.url).pathname
		var code, res
		if (g_handlers[request.method+request.url])
		{
			const chunks = [];
			request.on('data', chunk => chunks.push(chunk))
			request.on('end', () => {
				// POST параметры
				const data = Buffer.concat(chunks)
				params = qs.parse(data.toString())

				// запускаем обработчик
				g_redirect = null
				res = g_handlers[request.method+request.url](params)

				var i, cookie = []
				for (i in g_cookies)
					cookie.push(i + '=' + g_cookies[i] + (g_cookies[i]==null?'; Expires=Wed, 21 Oct 2015 07:28:00 GMT':'')) // COMMENT: для удаления ставим дату в прошлом

				if (g_redirect)
				{
					response.writeHead(code=302, {'Location': g_redirect, 'Set-Cookie': cookie})
				} else
				if (typeof(res) == 'string')
				{
					response.writeHead(code=200, {'Content-Type': 'text/html; charset=utf-8', 'Set-Cookie': cookie})
					response.write(res)
				}

				response.end()

				console.log(code+' '+request.method+' '+request.url)
			})
		}
		else
		{
			response.writeHead(code=404)
			response.end()
		}
	}).listen(port)
}

exports.redirect = function(url)
{
	g_redirect = url
}
