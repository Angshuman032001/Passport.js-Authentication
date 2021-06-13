const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20');
const keys = require('./keys');
const User = require('./../models/user-model');

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    User.findById(id).then((user) => {
        done(null, user);
    });
});

passport.use(
    new GoogleStrategy({
        //options for google strategy
        callbackURL: 'http://localhost:3000/auth/google/redirect',
        clientID: keys.google.clientID, 
        clientSecret: keys.google.clientSecret
    }, (accessToken, refreshToken, profile, done) => {
        //passport callback function  
        console.log(profile);
        console.log('passport callback function fired!');
        //check if user already exists
        User.findOne({ googleId: profile.id }).then((currentUser) => {
            if (currentUser) {
                //already found the user
                console.log('User is ', currentUser);
                done(null, currentUser);
            } else {
                //create user in our db
                new User({
                    username: profile.displayName,
                    googleId: profile.id,
                    thumbnail: profile._json.picture
                }).save().then((newUser) => {
                    console.log('new User created: ' + newUser);
                    done(null, newUser);
                })
            }
        })
    })
)