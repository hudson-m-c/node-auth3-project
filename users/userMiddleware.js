const Users = require('./user-model.js');
const bcrypt = require('bcryptjs');

module.exports = {
    validateCredentials,
    validateUser,
    restricted
}

function validateUser(req, res, next) {
    // make sure the req.body has username and password
    if(!req.body.username || !req.body.password) {
        res.status(400).json({message: 'Please send all information needed.'})
    } else {
        next();
    }
}

function validateCredentials(req, res, next) {
    // make sure the credentials match with db 
    const credentials = req.body;

    // find the user in the database by it's username then
    Users.findBy(credentials.username)
    .then( user => {
        if (!user || !bcrypt.compareSync(credentials.password, user.password)) {
            return res.status(401).json({ error: 'Incorrect credentials' });
        } else {
            req.body.userId = user.id;
            next();
        }
    })
    .catch( err => {
        res.status(500).json({errorMessage: "Could not find user."})
    })
}

function restricted(req, res, next) {
    if (req.token) {
        next();
    } else {
        res.status(401).json({ message: 'you shall not pass!!' });
    }
}