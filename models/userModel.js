import mongoose from 'mongoose';


const userSchema = mongoose.Schema({
	
	email:{
		type:String,
		required:true,
		unique:true
	},
	userName:{
		type:String
	},
	password:{
		type:String
	},
	role:{
		type:String
	},
	email_verified:{
		type:Boolean,
		default:false
	},
	createdAt:{
		type:Date,
		default:Date.now()
	}

});

module.exports = mongoose.model('User',userSchema);