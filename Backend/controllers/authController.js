const Author = require('../Models/bookAndAuther').Author
const jwt = require('jsonwebtoken');
const { request, response } = require('express');

// handle errors

const handleErrors = (err) => {
    console.log(err.message, err.code);
    let errors = {email: '', password: ''}

    if (err.message === 'incorrect email'){
        errors.email = 'that email is not registered';
    }

    if (err.message === 'incorrect password'){
        errors.password = 'that password is not registered';
    }


    if (err.code === 11000){
        errors.email = "that email is already registered"
        return errors;
    
        };

        if (err.message.includes('user validation faild')){
        Object.values(err.errors).forEach(({properties}) => {
            console.log(properties);
            errors[properties.path] = properties.message;
        })
    
    }
    return errors;
}

const maxAge = 3 * 24 * 60 *60 ;
const createToken = (id) => {
    return jwt.sign({id}, 'noura secret', {
        expiresIn: maxAge
    })
}

module.exports.signup_post = async (request,response) => {
    const {email, password,name,nationality,image} = request.body;
   try {
      const user = await  Author.create({email, password,name,nationality,image})
      const token = createToken(user._id)
      response.cookie('jwt', token, {httpOnly: true, maxAge: maxAge *1000 })
      response.status(201).json({user: user._id,token:token})
   }
   catch (err) {
      const errors = handleErrors(err);
      console.log(errors);
      response.status(400).json({errors});
   }
}

module.exports.login_post = async (request,response) => {
    const {email, password} = request.body;
        try {
            const user = await Author.login(email,password);
            const token = createToken(user._id)
            response.cookie('jwt', token, {httpOnly: true, maxAge: maxAge *1000 })
            response.status(200).json({user: user._id,token:token})

        }
        catch (err) {
            const errors = handleErrors(err);
            response.status(400).json({errors});
        }
}

module.exports.logout_get = (request,response) => {
    response.cookie('jwt','',{maxAge: 1});
    response.redirect('/');
}