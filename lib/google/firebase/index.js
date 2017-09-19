const fxy = require('fxy')
const firebase = {
	get Api(){ return require('./Api') },
	get Data(){ return require('./Data') },
	get Users(){ return require('./Users') },
	get tools(){ return require('./tools') }
}

class Firebase extends Map{
	constructor(admin,account){
		super()
		this.admin = admin
		if(fxy.is.data(account.credential)) {
			account.credential = admin.credential.cert(account.credential)
			this.api = new firebase.Api(admin.initializeApp(account))
		}
	}
	get database(){ return this.api.database }
}

//exports
module.exports = firebase
module.exports.require = get_require

//shared actions
function get_account(account,rxy){
	if(!fxy.is.data(account)) return null
	if(fxy.is.text(account.credential)) account.credential = require(fxy.join(rxy.folder,account.credential))
	return account
}

function get_require(options,rxy){
	const admin = require( fxy.join(rxy.node_modules,'firebase-admin') )
	let account = get_account(options.account,rxy)
	return new Firebase(admin,account)
	
}
