const express = require('express');
const bcrypt = require('bcryptjs');

const jwt = require('jsonwebtoken'); // installed this library
const secrets = require('../auth/config/secrets.js');
const Users = require('./user-model.js');
const uMid = require('./userMiddleware.js');

const router = express.Router();

// actions
router.post('/register', uMid.validateUser, (req, res) => {
    // create hash
    const credentials = req.body;

    const hash = bcrypt.hashSync(credentials.password, 14);

    credentials.password = hash;
    
    // add the user to the database
    Users.insert(credentials)
    .then( id => {
        res.status(201).json({id: id[0], ...credentials})
    })
    .catch( err => {
        res.status(500).json({errorMessage: "The user could not be created."})
    })
})


router.post('/login', uMid.validateUser, uMid.validateCredentials, (req, res) => {
  let { username, password } = req.body;

  console.log('req.body', req.body);

  Users.findBy({ username })
    .then(user => {
      console.log(user);
      if (user && bcrypt.compareSync(password, user.password)) {
        const token = generateToken(user); // new line
 
        // the server needs to return the token to the client
        // this doesn't happen automatically like it happens with cookies
        res.status(200).json({
          message: `Welcome ${user.username}!, have a token...`,
          token, // attach the token as part of the response
        });
      } else {
        res.status(401).json({ message: 'Invalid Credentials' });
      }
    })
    .catch(error => {
      res.status(500).json(error);
    });
});

function generateToken(user) {
  const payload = {
    subject: user.id, // sub in payload is what the token is about
    username: user.username,
    // ...otherData
  };

  const options = {
    expiresIn: '1d', // show other available options in the library's documentation
  };

  // extract the secret away so it can be required and used where needed
  return jwt.sign(payload, secrets.jwtSecret, options); // this method is synchronous
}

router.get('/users', uMid.restricted, (req, res) => {
    // if the user is logged in , return all users
    Users.find()
    .then( users => {
        res.status(200).json(users);
    })
    .catch( err => {
        res.status(500).json({errorMessage: "There was an error getting all the users."})
    })
})


module.exports = router;