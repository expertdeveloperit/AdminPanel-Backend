import express from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import userModel from '../models/userModel';
import randtoken from  'rand-token';
import timediff from  'timediff';
import multer from 'multer';
import config from '../config/config';
import ensureAuthentication from '../config/ensure-authentication';
import {storage} from '../config/fileUpload';

randtoken.generate();


let user ={
	/* This controller performs
		*User Registeration
		*User Login
	*/
	//controller to perform login operation

	signUp(req,res,next){

		if(Object.keys(req.body).length){

			let email = req.body.email;
			let userName = req.body.name;
			let role = req.body.role;
			let old_password = req.body.password;
			let password ;

			userModel.findOne({"email":email})
			.then(data => {
				if(data){
					res.status(404).json({
						status:false,
						message:"User with this email altrady exists please select another one"
					});
				}
				else{
					bcrypt.genSalt(10, function(err, salt) {
    					bcrypt.hash(old_password, salt, function(err, hash) {
       				  		if(err){
       				  			res.status(404).json({
       				  				status:false,
       				  				Error:err.code
       				  			});
       				  		}
       				  		else{
       				  			password = hash;
       				  			var newUser = new userModel({
       				  				email,
       				  				userName,
       				  				role,
       				  				password
       				  			});

       				  			newUser.save((err,data) => {
       				  				if(err){
       				  					res.status(404).json({
       				  						status:false,
       				  						Error:err.message,
       				  						Message:"Error while registering user"
       				  					});
       				  				}
       				  				else{
       				  					res.status(200).json({
       				  						status:true,
       				  						user:data,
       				  						Message:"User registered successfully"
       				  					});
       				  				}
       				  			});
       				  		}
    					});
					})
				}
			})
		}
		else{
			res.status(503).json({
				status:false,
				response:'Empty request body'
			});
		}
	},

	/*
		checks for user credential and generates a token on successful login
	*/

	login(req,res,next){

		console.log(req.body);
		var email = req.body.email;
		var password = req.body.password;

		if(Object.keys(req.body).length){
			userModel.findOne({"email":email})
			.then(data => {
				if(data){
					bcrypt.compare(password, data.password, function(err, isMatched) {
						if(err){
							res.status(404).json({
								status:false,
								error:err.message,
								Message:"Error while checking password"
							});
						}
						if(isMatched){
							var isVerified = data.email_verified;
							var created_date = data.createdAt;
							var token;
							var  payload = {id : data._id};

            				token =  jwt.sign(payload,config.auth.secret);
							res.status(200).json({
								status:true,
								authenticated:true,
								data:data,
								token:token
							});
						}
						else{
							res.status(404).json({
								status:false,
								message:"Password doesnot match"
							});
						}
     
					});
				}
				else{
					res.status(404).json({
						status:false,
						message:"Not a registered user"
					});
				}
			})
			.catch(err => {
				res.status(404).json({
					status:false,
					Error:err.message
				});
			});

		}
		else{
			res.status(404).json({
				status:false,
				Message:"Empty request body"
			});
		}
	},

	// returns a list of existing users from database

	allusers(req,res,next){

		userModel.find({"role":"user"})
		.then(data => {
			if(data.length){
				res.status(200).json({
					status:true,
					data:data
				});
			}
			else{
				res.status(200).json({
					status:false,
					message:"No data to display"
				});
			}
		})
		.catch(err => {
			res.status(404).json({
				status:false,
				err:err.message
			});
		});
	},

	//returns details about user whose id is received in params

	userInfo(req,res,next){

		var id = req.params.id;

		userModel.findOne({"_id":id})
		.then(data => {
			if(!data){
				res.status(404).json({
					status:false,
					message:"Sorry!No user with this id exists"
				});
			}
			else{
				res.status(200).json({
					status:true,
					userData:data
				});
			}
		})
		.catch(err => {
			res.status(404).json({
				status:false,
				Error:err.message,
			});
		});
	},

	//updates a specific user info
	
	updateUser(req,res,next){

		var id = req.params.id;
		var email = req.body.email;
		var userName = req.body.userName;
		

		userModel.findOne({"_id":id})
		.then(data => {
			if(!data){
				res.status(404).json({
					status:false,
					message:"Please send a valid user id"
				});
			}
			else{
				userModel.findByIdAndUpdate({"_id":id},{"email":email,"userName":userName},{new:true})
				.then(updatedData => {
					res.status(200).json({
						status:true,
						data:updatedData
					});
				})
				
			}
		})
		.catch(err => {
			res.status(404).json({
				status:false,
				Error:err.message
			});
		})
	},

	profilePicture(user,req,res,next){

		var user = user._id;

		userModel.findOne({"_id":user})
		.then(data => {
			if(data){

				var upload = multer({
								storage: storage
							}).single('file')

				upload(req, res, function(err) {
					if(err){
						res.status(404).json({
							status:false,
							Error:err.message
						});
					}
					console.log( req.file,"dfij");

					var imageSrc = req.file.path;

					userModel.findByIdAndUpdate(
						{"_id":user},
						{ $set: { "profilePicture": imageSrc } },
						{new: true},
						function(err,uploaded){
						if(err){
							res.status(404).json({
								status:false,
								Error:err.message
							});
						}
						else{
							res.status(200).json({
								status:true,
								result:uploaded
							});
						}
					});
				});
			}
			else{
				res.status(404).json({
					status:false,
					message:"Invalid user"
				});;
			}
		})
		.catch(err => {
			res.status(404).json({
				status:false,
				Error:err.message
			});
		});

		

	},
	userData(user,req,res,next){

		var user = user._id;

		userModel.findOne({"_id":user})
		.then(data => {
			if(data){
				res.status(200).json({
					status:true,
					data:data
				});
			}
			else{
				res.status(404).json({
					status:false,
					Message:"Invalid userId"
				});
			}
		})
		.catch(err => {
			res.status(404).json({
				status:false,
				Error:err.message
			});
		})
	}
	
}



module.exports = user;