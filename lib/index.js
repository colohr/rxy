const fxy = require('fxy')
const modules = new Map(get_modules())

class Rxy {
	constructor(project) {
		this.folder = project.folder
		this.node_modules = fxy.join(this.folder,'node_modules')
		this.options = project.rxy
		this.ready = set_rxy(this)
	}
}


//exports
module.exports = new Proxy(get_rxy,{
	get(o,name){
		if(modules.has(name)) return require(module.get(name).get('path'))
		return o[name]
	},
	has(o,name){ return modules.has(name) }
})


function get_modules(){
	return fxy.tree(__dirname).items
	          .filter(item=>item.get('type').directory)
	          .map(item=>[item.name,item])
}

function get_rxy(options_or_path){
	let options = null
	if(fxy.is.data(options_or_path)) options = options_or_path
	else if(fxy.is.text(options_or_path)){
		if(options_or_path.includes('app.json') !== true) options_or_path=fxy.join(options_or_path,'app.json')
		if(fxy.exists(options_or_path)) options = require(options_or_path)
	}
	if(!fxy.is.data(options) || !('rxy' in options)) throw new Error(`The rxy options value are invalid`)
	return new Rxy(options)
}

function set_rxy(rxy){
	let errors = []
	let options = rxy.options
	for(let name of modules.keys()){
		let item = modules.get(name)
		let target = require(item.get('path'))
		for(let i in target){
			if(i in rxy.options){
				let option = target[i]
				if('require' in option) {
					try{ rxy[i] = option.require(options[i],rxy) }
					catch(e){ errors.push(e) }
				}
				else rxy[i] = option
			}
		}
	}
	if(errors.length) {
		errors.forEach(error=>console.error(error))
		rxy.errors = errors
	}
	return 'errors' in rxy ? false:true
}