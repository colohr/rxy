const actions = {
	account:{
		changed:'onAuthStateChanged',
		create:'createUserWithEmailAndPassword',
		providers:'fetchProvidersForEmail',
		uid:'getUid'
	},
	action_code:{
		apply:'applyActionCode',
		check:'checkActionCode'
	},
	password:{
		confirm:'confirmPasswordReset',
		email:'sendPasswordResetEmail',
		verify:'verifyPasswordResetCode'
	},
	sign_in:{
		redirect_result:'getRedirectResult'
	},
	token:{
		add_listener:'addAuthTokenListener',
		changed:'onIdTokenChanged',
		id:'getIdToken',
		remove_listener:'removeAuthTokenListener'
	}
}
const collection = [ 'added','removed','changed','moved' ]

//exports
module.exports = {
	actions,
	collection
}