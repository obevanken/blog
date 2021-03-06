var db = require('../models');
var LocalStrategy = require('passport-local').Strategy;
var joi = require('joi');




module.exports = function(passport) {
  passport.use('auth', new LocalStrategy({
      passReqToCallback: true
    },
    async function(req, username, password, done){

      try {

        var schema = joi.object().keys({
          username: joi.string().alphanum().min(3).max(30),
          password: joi.string().min(4).max(10)
        });

        var valid = await joi.validate({
          username: req.body.username,
          password: req.body.password,
        }, schema);

        var us = await db.users.findOne({
          where: {
            username: req.body.username,
          }
        })

        if (!us) {
          console.log("Incorrect username");
          return done(null, false, req.flash('message', 'Incorrect username.'));
        }

        var result = await us.verifyPass(password);

        if (!result) {
          console.log("Incorrect password");
          return done(null, false, req.flash('message', 'Incorrect password.'));
        }

        return done(null, us, console.log(result.username));

      } catch(err) {
        console.error(err);
        return done(null, false, req.flash('message', err.details[0].message))
      }
    }
  ));
}
