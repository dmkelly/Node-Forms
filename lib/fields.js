var crypto = require('crypto');		// Required for hashing passwords.

var field = exports;

/**
 * A basic form field.
 * @param value The form data corresponding to value of this field.
 * @param options Options to pass to the field that are unique to that instance
 * 		of the field. These may be useful for validation of the field.
 * 		For example, the &#039;blank&#039; option may be specified. If true, the
 * 		field will not pass validation if its value is blank or null.
 * @returns {field.Field}
 */
field.Field = function(value, options) {
	this.value = value;
	this.options = options || {};
};

/**
 * Performs necessary checks on the value of this field.
 * @returns {Boolean} True if valid, false if not valid.
 */
field.Field.prototype.validate = function() {
	if(this.options.blank === false)
		return this.value != '';
	return true;
};

/**
 * Validates the field value as an email address.
 * @param value An email address.
 * @param options Supports &#039;expression&#039; as a custom regular expression
 * 		to use for validation of email address format in addition to default
 * 		field options.
 * @returns {field.EmailField}
 */
field.EmailField = function(value, options) {
	field.Field.call(this, value, options);
	this.EXPRESSION = this.options.expression || /^\S+@\S+?\.\S{2,3}$/;
};

field.EmailField.prototype = new field.Field();
field.EmailField.constructor = field.EmailField;

field.EmailField.prototype.validate = function() {
	return this.options.blank && this.value == '' || this.EXPRESSION.test(this.value);
};

/**
 * Validates the field as a password. This is useful for doing lookups involving
 * passwords. By default, an unsalted sha512 hash is used for encryption.
 * @param value A password.
 * @param options Supports &#039;salt&#039; to salt the hash and
 * 		&#039;algorithm&#039; to specify an algorithm other than sha512.
 * @returns {field.PasswordField}
 */
field.PasswordField = function(value, options) {
	field.Field.call(this, value, options);
};

field.PasswordField.prototype = new field.Field();
field.PasswordField.constructor = field.PasswordField;

field.PasswordField.prototype.validate = function() {
	return this.value.length > 0;
};

/**
 * Encrypts the password value based on the options provided to the field.
 * @returns The encrypted password.
 */
field.PasswordField.prototype.encrypt = function() {
	var salt = this.options.salt || '';
	var algorithm = this.options.algorithm || 'sha512';
	return crypto.createHash(algorithm).update(salt + this.value).digest('hex');
};

/**
 * A field used to validate input for a username.
 * @param value User input for a username.
 * @param options Supports &#039;expression&#039; as a custom regular expression
 * 		to use for validation of user name format.
 * @returns {field.UserField}
 */
field.UserField = function(value, options) {
	field.Field.call(this, value, options);
	this.EXPRESSION = this.options.expression || /^[a-zA-Z0-9@\.\+\-_]{1,15}$/;
};

field.UserField.prototype = new field.Field();
field.UserField.constructor = field.UserField;

field.UserField.prototype.validate = function() {
	return this.EXPRESSION.test(this.value);
};

/**
 * Validates a pair of passwords to ensure they match. To get an encrypted
 * value out of this field, use fieldObject.password1.encrypt().
 * @param password1 The value for the first password input.
 * @param password2 The value for the second password input.
 * @param options
 * @returns {field.SetPasswordFields}
 */
field.SetPasswordFields = function(password1, password2, options) {
	field.Field.call(this, password1, options);
	this.password1 = new field.PasswordField(password1);
	this.password2 = new field.PasswordField(password2);
};

field.SetPasswordFields.prototype = new field.Field();
field.SetPasswordFields.constructor = field.SetPasswordFields;

field.SetPasswordFields.prototype.validate = function() {
	return typeof(this.password1.value) == 'string' &&
			this.password1.value.length > 0 &&
			this.password1.value === this.password2.value;
};

/**
 * Validates checkbox input. After initialization, the value of this field will
 * be either true to indicate that the checkbox is checked, or false to indicate
 * that the checkbox is not checked.
 * @param value The checkbox input by the user. If unchecked, it will be undefined.
 * @param options
 * @returns {field.CheckboxField}
 */
field.CheckboxField = function(value, options) {
	field.Field.call(this, value, options);
	this.value = this.isChecked();
};

field.CheckboxField.prototype = new field.Field();
field.CheckboxField.constructor = field.CheckboxField;

field.CheckboxField.prototype.isChecked = function() {
	return typeof(this.value) != 'undefined' && this.value;
};

/**
 * Validates text input as a URL.
 * @param value User input for a URL.
 * @param options Supports &#039;absolute&#039; as a boolean to indicate whether
 * 		the URL should be considered an absolute URL (default false), and
 * 		&#039;expression&#039; to specify a custom regular expression to validate
 * 		the URL format.
 * @returns {field.URLField}
 */
field.URLField = function(value, options) {
	field.Field.call(this, encodeURI(value), options);
	this.absolute = typeof(this.options.absolute) == 'boolean' && this.options.absolute;
	this.EXPRESSION = this.options.expression || (this.absolute ? /^(https?:)?\/\/\S+\.\S+/ : /\S+/);
};

field.URLField.prototype = new field.Field();
field.URLField.constructor = field.URLField;

field.URLField.prototype.validate = function() {
	return this.EXPRESSION.test(this.value);
};

/**
 * Validates input against possible choices.
 * @param value User input for a choice.
 * @param options Supports &#039;choices&#039; as an array of acceptable choices.
 * @returns {field.ChoiceField}
 */
field.ChoiceField = function(value, options) {
	field.Field.call(this, value, options);
	this.options.choices = (typeof(this.options.choices) == 'undefined' ? [] : this.options.choices);
};

field.ChoiceField.prototype = new field.Field();
field.ChoiceField.constructor = field.ChoiceField;

field.ChoiceField.prototype.validate = function() {
	if(typeof(this.options.choices) != 'object' || this.options.choices.length == 0)
		return false;
	return this.options.choices.indexOf(this.value) > -1;
};