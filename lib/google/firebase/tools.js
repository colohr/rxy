const fxy = require('fxy')
const info = require('./info')

//exports
module.exports.get_action = get_action
module.exports.get_collection = get_collection
module.exports.get_on = get_on
module.exports.get_savable = get_savable
module.exports.get_snapshot = get_snapshot
module.exports.get_value = get_value
module.exports.get_watch = get_watch

//shared actions
function get_action(type,controller,matching){
	let actions = info.actions[type]
	let names = get_names(controller)
	return new Proxy(controller,{
		get(o,name){
			let value = null
			if(fxy.is.text(name)){
				name = get_name(o,name)
				if(name in o) value = o[name]
			}
			else if(name in o) value = o[name]
			if(fxy.is.function(value)) value = value.bind(o)
			return value
		}
	})
	//shared actions
	function get_names(object){
		if(fxy.is.object(object) === false || !fxy.is.text(matching)) return []
		return Object.keys(object).filter(name=>name.includes(matching))
	}
	function get_name(o,name){
		if(name in o) return name
		name = fxy.id._(name)
		if(type === 'sign_in' && !name.includes('sign_in')){
			let sign_in_name = fxy.id.code(`sign_in_${name}`)
			if(sign_in_name in o) return sign_in_name
		}
		if(name in actions) return  actions[name]
		else if(names.includes(name)) return name
		return name
	}
}

function get_collection(data){
	const Collection = require('./Collection')
	return new Proxy(data,{
		get(o,name){
			if(fxy.is.text(name)){
				let path = fxy.id.path(name)
				if(o.has(path)) return o.get(path)
				return o.set(path,new Collection(o.database.ref(path))).get(path)
			}
			return null
		},
		has(o,name){ return o.has(name) }
	})
}

function get_on(collection,reference){
	return new Proxy(connect(),{
		get(o,name){
			if(o.has(name)) return o.get(name)
			if(name === 'disconnect') return disconnect
			return null
		},
		has(o,name){ return o.has(name) },
		set(o,name,action){
			if(fxy.is.text(name)) o.set(name,action)
			return true
		}
	})
	//shared actions
	function connect(){
		for(let name of info.collection){
			reference.on(`child_${name}`, (...x) => {
				x[0]=get_snapshot(x[0])
				if(collection.has(name)) return collection.get(name)(...x)
			})
		}
		return collection
	}
	function disconnect(){
		for(let name of info.collection){
			reference.off(`child_${name}`)
			collection.delete(name)
		}
		return collection
	}
}

function get_savable(value){
	if(fxy.is.array(value)){
		let o = {}
		value.forEach((item,i)=>o[i] = item)
		return o
	}
	return value
}

function get_snapshot(snapshot){
	return new Proxy(snapshot,{
		get(o,name){
			let value = null
			switch(name){
				case 'array':
					value = o.val()
					return fxy.is.nothing(value) ? []:Object.keys(value).map(key=>{return value[key]})
				case 'count':
				case 'length':
					return o.numChildren()
				case 'data':
				case 'value':
					return o.val()
				case 'empty': return o.exists() === true ? o.numChildren() === 0:true
				case 'nothing': return fxy.is.nothing(o.val())
			}
			if(name in o) {
				value = o[name]
				if(fxy.is.function(value)) value.bind(o)
			}
			return value
		}
	})
}

function get_value(collection){
	return new Proxy(collection,{
		get(o,name){
			if(fxy.is.text(name)) return value(o,name)
			return null
		}
	})
	//shared actions
	function value(o,name){
		return new Promise((success,error)=>{
			let child = o.child(name)
			return child.once('value')
			            .then(snapshot=>get_snapshot(snapshot))
			            .then(success)
			            .catch(error)
		})
	}
}

function get_watch(collection){
	return new Proxy(collection,{
		deleteProperty(o,name){ return unwatch(o,`${name}-watcher`) },
		get(o,name){
			let id = `${name}-watcher`
			if(o.has(id)) return o.get(id)
			return null
		},
		has(o,name){
			let id = `${name}-watcher`
			return o.has(id)
		},
		set(o,name,value){
			if(fxy.is.function(value)) {
				let watcher = watch(o,name,value)
				o.set(watcher.id,watcher)
			}
			return true
		}
	})
	//shared actions
	function watch(o,name,action){
		let id = `${name}-watcher`
		unwatch(o,id)
		let watcher = { id, name }
		let path = fxy.id.path(name)
		watcher.action = function watcher_action(snapshot){ return action(get_snapshot(snapshot)) }
		o.child(path).on('value',watcher.action)
		return watcher
	}
	function unwatch(o,id){
		if(!o.has(id)) return true
		let watcher = o.get(id)
		let path = fxy.id.path(name)
		o.child(path).off('value',watcher.action)
		o.delete(id)
		return true
	}
}