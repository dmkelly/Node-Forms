var form = exports;

form.field = require('./fields.js');

/**
 * Abstract parent Form class. This should be extended for each form used. Child
 * Forms should populate the fields object with key-value pairs where each value
 * is a type of Field object.
 * @param data The form data. This should be an object with key-value pairs.
 * 		Typically, data will be the POST data from a form submission.
 * @param options Options to pass to the form that are unique to that instance
 * 		of the form. These may be useful for validation or saving from child
 * 		Forms.
 * @returns {form.Form}
 */
form.Form = function(data, options) {
	this.fields = {};
	this.options = options || {};
};

/**
 * Validates each field in the form.
 * @returns {Boolean} True if everything is valid, false if the form does not
 * 		validate.
 */
form.Form.prototype.validate = function() {
	for(var i in this.fields)
		if(! this.fields[i].validate())
			return false;
	return true;
};

/**
 * Child forms should contain the functionality to handle data passed into the
 * form.
 * @param validate Optional, if false, the form will not be validated first.
 * @param callback A function to be executed after the content has been handled
 * 		by the save function. Any errors will be passed as the first parameter
 * 		to the callback function.
 */
form.Form.prototype.save = function(validate, callback) {
	if(typeof(validate) == 'function') {
		callback = validate;
		validate = true;
	}
	
	if((! validate) || (validate && this.validate())) {
		// Child forms should save appropriately here.
		
		callback();
	} else {
		callback('Form failed validation.');
	}
};