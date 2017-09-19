const get_collection = require('./tools').get_collection
class Data extends Map{
	constructor(firebase){
		super()
		this.firebase = firebase
	}
	get collection(){ return get_collection(this) }
	get database(){ return this.firebase.database() }
}

//exports
module.exports = Data