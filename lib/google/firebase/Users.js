const get_action = require('./tools')

class Users{
	constructor(firebase){this.firebase=firebase}
	get account(){ return get_action('account',this.auth) }
	get action_code(){ return get_action('action_code',this.auth) }
	get auth(){ return this.firebase.auth() }
	get sign_in(){ return get_action('sign_in',this.auth,'signIn') }
	get user(){ return this.auth.currentUser }
}

//exports
module.exports = Users