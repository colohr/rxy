const Data = require('./Data')
const database = Symbol('firebase database')
class Api{
	constructor(firebase){
		this.firebase = firebase
	}
	get database(){ return database in this ? this[database]:this[database] = new Data(this.firebase) }
}

//exports
module.exports = Api