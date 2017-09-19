const tools = require('./tools')
const get_on = tools.get_on
const get_snapshot = tools.get_snapshot
const get_value = tools.get_value
const get_watch = tools.get_watch
const get_savable = tools.get_savable

class Collection extends Map{
	static get savable(){ return get_savable }
	constructor(reference){
		super()
		console.log('collection path:',reference.key)
		this.name = reference.ref.key
		this.child = name=>reference.child(name)
		this.data = ()=>{
			return new Promise((success,error)=>reference.once('value').then(get_snapshot).then(success).catch(error))
		}
		this.on = get_on(this,reference)
	}
	save(child_name,data){
		let child = this.child(child_name)
		data = get_savable(data)
		return child.set(data)
	}
	get value(){ return get_value(this) }
	get watch(){ return get_watch(this) }
}

//exports
module.exports = Collection