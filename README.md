# Node Api Server

To start The application

 - git clone https://github.com/abhishek0494/node-server-api.git
 - npm install (This will install all the dependency)
 - npm start will start the node server on port 5000

# DB Folder

DB folder contains the database conection code and models for various collection

## Api
 1. http://localhost:5000/file - This is a post request to upload a csv file into mongodb.
 2. http://localhost:5000/policyinfo?username=Vergie Hardesty - This is a get api that returns the policy for a given username takes a queryparams username as input.
 3. http://localhost:5000/insert/message - This Api stores a message into mongodb on a given date and time. example data to pass in request body       {
	"date" : "02-18-2020",
	"time" : "14:22:00",
	"message" : "save body"
}
 4. http://localhost:5000/getpolicy/byuser - This APi returns aggregated policy for each user.
