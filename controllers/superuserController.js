import express from 'express';
import mongoose from 'mongoose';
import userModel from '../models/userModel';


module.exports = {
//deletes the requested user
	deleteuser(req,res,next){

		var id = req.params.id;

		userModel.findOne({"_id":id})
		.then(data => {
			if(data){
				userModel.findByIdAndRemove({"_id":data._id},function(err,isdeleted){
					if(err){
						res.status(404).json({
							status:false,
							Error:err.message
						});
					}
					else{
						res.status(200).json({
							status:true,
							message:`User with id ${id} deleted`
						});
					}
				})
			}
			else{
				res.status(404).json({
					status:false,
					message:`user with this id ${id}`
				});
			}
		})
		.catch(err => {
			res.status(404).json({
				status:false,
				error:err.messgae,
				message:"Error while finding user"
			});
		});
	}
	
}