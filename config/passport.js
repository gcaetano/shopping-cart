// var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var User = require = require('../models/user');

// expose this function to our app using module.exports
module.exports = function (passport) {

    passport.serializeUser(function (user, done) {
        done(null, user.id)
    });

    passport.deserializeUser(function (id, done) {
        User.findById(id, function (err, user) {
            done(err, user);
        });
    });

    passport.use('local.signup', new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true
    },
        function (req, email, password, done) {
            req.checkBody('email','Invalid Email').notEmpty().isEmail();
            req.checkBody('password','Invalid Password').notEmpty().isLength({min:4});
            var errors = req.validationErrors();
            if(errors){
                var messages = [];
                errors.forEach(function(error){
                    messages.push(error.msg);
                });
                return done(null, false, req.flash('error', messages));
            }
            User.findOne({ 'email': email }, function (err, user) {
                if (err) {
                    return done(err);
                }
                if (user) {
                    return done(null, false, { message: 'Email is already in use.' })
                }
                var newUser = new User();
                newUser.email = email;
                newUser.password = newUser.encryptPasswod(password);
                newUser.save(function (err, result) {
                    if (err) {
                        done(err);
                    }
                    if (user) {
                        done(null, newUser);
                    }
                });
            });
        })
    );
}