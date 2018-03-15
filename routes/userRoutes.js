import express from 'express';
import userController from '../controllers/userController';
import ensureAuthentication from '../config/ensure-authentication';

//creating instance of router
const router = express.Router();


//creating routes for user login,signup


/* 
	Checks for user login 
	generate token on successful login 
*/
	router.route('/login')
	.post(
		userController.login
		);

/* 
	route to Performs user signup  
*/
	router.route('/signup')
	.post(
		userController.signUp
		);

/* 
	Route to fetch existing users 
*/
	
	router.route('/users')
	.get(
		userController.allusers
		);

/* 
	Route to fetch specific user details whose id is received through params 
*/
	router.route('/user/:id')
	.get(
		userController.userInfo
		);

/* 
	Route to update specific  user whose id is received in params 
*/

	router.route('/update/:id')
	.put(
		userController.updateUser
		);

/* 
	Route to update specific  user whose id is received in params 
*/

	router.route('/image')
	.put(
		ensureAuthentication.authenticate,
		userController.profilePicture
		);

	router.route('/userdata')
	.get(
		ensureAuthentication.authenticate,
		userController.userData
		);
	

module.exports = router;