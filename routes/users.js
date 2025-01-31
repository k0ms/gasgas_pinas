var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var crypto = require('crypto');



var USERS = mongoose.model('users');
var VEHICLES = mongoose.model('vehicles');

var addUser = function(req,res,next) {

	console.log(JSON.stringify(req.body));
	var reqEntry = req.body;
	reqEntry._id = new mongoose.Types.ObjectId;
	reqEntry.date_modified = dateToUnixEpoch(new Date(reqEntry._id.getTimestamp()));
	reqEntry.auth.password = toMD5(reqEntry.auth.password);
	reqEntry.vehicles = [];
	if(!reqEntry.info.dp || reqEntry.info.dp == "") {
		if(reqEntry.info.gender == "Male") {
			reqEntry.info.dp = "https://s3-ap-southeast-1.amazonaws.com/gasgaspinas/unknown-male.jpg";
		}
		else if(reqEntry.info.gender == "Female") {
			reqEntry.info.dp = "https://s3-ap-southeast-1.amazonaws.com/gasgaspinas/unknown-female.jpg";
		}
	}

	var newEntry = new USERS(reqEntry);

	
	newEntry.save(function(err, entry, numbersAffected){
		req.err = err;
		req.entry = entry;
		next();
	});
};

var sendResponse = function(req,res,next) {
	if(req.err) 
		res.send({msg: false, err: req.err});
	else {
		res.send({msg: true, data: req.entry});
	}
};


router.put('/vehicles/:id', [function(req,res,next){

	var user_id = req.params.id;
	var vehicle_id = req.query.vehicle_id;
	console.log(vehicle_id);

	VEHICLES.update({_id: new mongoose.Types.ObjectId(req.params.id)}, {$set: req.body},
		function(err, numbersAffected, raw){
			req.err = err;
			req.entry = raw;
			next();
		});

},sendResponse]);

router.delete('/vehicles/:id', [function(req, res, next) {
	VEHICLES.remove({_id: new mongoose.Types.ObjectId(req.params.id)}, 
		function(err) {
			req.err = err;
			req.entry = null;
			next();
		}
	);
},sendResponse]);

//utils
toMD5 = function(password) {
	return crypto.createHash('md5').update(JSON.stringify(password)).digest("hex");
}

dateToUnixEpoch = function(date) {
	return date.getTime()/1000;
}
generateUsers = function() {

	var ret = {
		auth: {
			username: "koms",
			password: "test12345",
			type: {
				social: "",
				social_id: "",
			}
		},
		info: {
			first_name: "Mark Lester",
			last_name: "Samaniego",
			gender: "male",
			DoB: new Date(1985, 07, 10, 0,0, 0, 0),
			email: "mark.samaniego@gmail.com",
			dp: "/path/to/url",
		},
		vehicles: [],
		isActive: true,
		date_modified: Date.now()
	}

	return ret;
}

module.exports = router;
