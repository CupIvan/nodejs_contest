var fs = require('fs')

const DB_NAME = 'users.json'

function db_load()
{
	var a = {}
	try {
		var data = fs.readFileSync(DB_NAME)
		var a = JSON.parse(data)
	} catch(e){}
	return a ? a : {}
}

function db_save(db)
{
	let json = JSON.stringify(db)
	fs.writeFileSync(DB_NAME, json)
}

exports.getUser = function(email)
{
	var db = db_load()
	var res = null
	if (db[email]) { res = db[email]; res.email = email; }
	return res
}

exports.createUser = function(a)
{
	if (!a.email) return false
	var db = db_load()
	db[a.email] = {password: a.password}
	db_save(db)
	return true
}
