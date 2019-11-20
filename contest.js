const server = require('./server')
const db = require('./db')

var html = {
	page_header:       '<!DOCTYPE html><head><meta charset="utf-8"><head><body>',
	form_fields:       '<input type=email name=email placeholder=email /><input type=password name=password placeholder=password /><input type="submit">',
	form_login:        '<h1>Авторизация</h1><form action="/login" method="POST"></form>',
	form_signup:       '<h1>Регистрация</h1><form action="/signup" method="POST"></form>',
	error_user_nofound:'<p>Такой пользователь не существует</p>',
	error_user_exists: '<p>Такой пользователь уже есть</p>',
	error_user_create: '<p>Ошибка при регистрации</p>',
	error_user_logout: '<p>Вы не вошли</p>',
	page_if_login:     'email: <b>[email]</b><br><a href="/logout">Выход</a>',
	page_if_logout:    '<a href="/login">Вход</a> <a href="/signup">Регистрация</a>',
}

var x
html.form_login  = html.form_login .replace(x='</form', html.form_fields+x)
html.form_signup = html.form_signup.replace(x='</form', html.form_fields+x)

function login(a)
{
	server.setCookie('email', a.email)
}
function logout(a)
{
	server.deleteCookie('email')
}
function is_login()
{
	return server.getCookie('email')
}
function getEmail() { return server.getCookie('email') || '' }

server.on('GET', '/', function(request){
	var st = html.page_header
	st += is_login(request) ? html.page_if_login.replace('[email]', getEmail()) : html.page_if_logout
	return st
})

server.on('GET', '/signup', function(){
	return html.page_header+html.form_signup
})

server.on('POST', '/signup', function(request){
	var st = html.page_header
	var user = db.getUser(request.email)
	if (user)
	{
		st += html.error_user_exists
		st += html.form_signup
		return st
	}
	else
	{
		if (!db.createUser(request))
			return html.error_user_create
		login(request)
	}
	server.redirect('/')
})
server.on('GET', '/login', function(){
	return html.page_header+html.form_login
})
server.on('POST', '/login', function(request){
	var user = db.getUser(request.email)
	if (user && user.password == request.password)
	{
		login(user)
		server.redirect('/')
	} else
		return html.page_header+html.error_user_nofound+html.form_login
})
server.on('GET', '/logout', function(){
	if (!is_login())
		return html.error_user_logout
	logout()
	server.redirect('/')
})

server.start()
