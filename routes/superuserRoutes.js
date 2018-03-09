import express from 'express';
import superuserController from '../controllers/superuserController';


let router = express.Router();

/*
	Route to delete a specific user from database whose id is received through params
*/
router.route('/removeuser/:id')
	.delete(
		superuserController.deleteuser
		);



module.exports = router;