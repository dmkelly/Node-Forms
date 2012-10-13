Forms
=====

A light-weight, high-level form validation helper for Node.js

Introduction
------------

Forms takes an object-oriented approach to validating form input. Implemented
forms should extend the provided Form object. Each form should consist of a
key-value set of fields, where each field is a Field object or a child of the
Field object. The form should then be validated or saved.

Supported Fields
----------------

Forms and fields are simple to extend. Out of the box, the following fields are
supported:

- text input
- email address
- URL
- password
- confirm password
- choice (select/radio)
- checkbox

Usage
-----

Each form implementation requires a custom extension of the Form object. This
object should have complex type property called *fields* that has a key-value
set of field objects corresponding to the fields in the form. The custom form
child object should override a *save()* function that takes a callback function
as a parameter. The callback function should take any errors thrown by the save
function as its first parameter. The save function should handle any logic
involved in storing the form input.

Example
-------
``` js
  var form = require('./form.js');
  var field = form.fields;
  var User = require('./mongo/user_model.js');  // MongoDB model.
  
  var RegisterForm = function(post) {
    form.Form.call(this, post);
    this.fields = {
      firstname: new field.Field(post.firstname),
      lastname: new field.Field(post.lastname),
      email: new field.EmailField(post.email),
      username: new field.UserField(post.username),
      passwords: new field.SetPasswordFields(post.password1, post.password2)
	};
  };
  
  myform.RegisterForm.prototype = new form.Form();
  myform.RegisterForm.constructor = myform.RegisterForm;
  
  RegisterForm.prototype.save = function(validate, callback) {
    if(typeof(validate) == 'function') {
      callback = validate;
      validate = true;
	}
	if((! validate) || (validate && this.validate())) {
	  var reg = this;
	  new User({
	    firstname: reg.fields.firstname.value,
	    lastname: reg.fields.lastname.value,
	    email: reg.fields.email.value,
	    username: reg.fields.username.value,
	    password: reg.fields.passwords.password1.encrypt()
	  }).save(callback);
	} else {
	  callback('Form failed validation');
	}
  };
  
  
  // In a function to handle a POST request...
  app.post('/register', function(req, res) {  
    var reg = new forms.RegisterForm(req.body);
    reg.save(function(err) {
      if(err) {
	    handleErr(err);
        return;
      }
      // Respond to user.
      res.redirect('/');
    });
  });
```