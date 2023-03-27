function checkUsernameEmail(username, email) {
    // Make an AJAX request to the server to check if the username and email already exist
    $.ajax({
      url: "/check_username_email/",
      method: "POST",
      data: { username: username, email: email },
      success: function (response) {
        if (response.username_exists) {
          // The username already exists, show an error message
          $("#username-error").text("This username is already taken.");
        } else {
          // The username doesn't exist, remove the error message (if any)
          $("#username-error").text("");
        }
  
        if (response.email_exists) {
          // The email already exists, show an error message
          $("#email-error").text("This email is already registered.");
        } else {
          // The email doesn't exist, remove the error message (if any)
          $("#email-error").text("");
        }
      },
      error: function () {
        // Handle the error here (if any)
      }
    });
  }


function signup() {
    // Get input field values
    var username = document.getElementById("username").value;
    var fname = document.getElementById("fname").value;
    var lname = document.getElementById("lname").value;
    var email = document.getElementById("email").value;
    var pass1 = document.getElementById("pass1").value;
    var pass2 = document.getElementById("pass2").value;
  
    // Regular expressions for validation
    var emailRegex = /^\S+@\S+\.\S+$/;
    var passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/;
  
    // Error messages
    var usernameError = "";
    var fnameError = "";
    var lnameError = "";
    var emailError = "";
    var pass1Error = "";
    var pass2Error = "";
  
    // Validate input fields
    if (username === "") {
      usernameError = "Please enter a username";
    }
  
    if (fname === "") {
      fnameError = "Please enter your first name";
    }
  
    if (lname === "") {
      lnameError = "Please enter your last name";
    }
  
    if (!emailRegex.test(email)) {
      emailError = "Please enter a valid email address";
    }
  
    if (!passwordRegex.test(pass1)) {
      pass1Error =
        "Password must be at least 8 characters and contain at least one uppercase letter, one lowercase letter, and one number";
    }
  
    if (pass1 !== pass2) {
      pass2Error = "Passwords do not match";
    }
  
    // Show error messages
    document.getElementById("username-error").innerHTML = usernameError;
    document.getElementById("fname-error").innerHTML = fnameError;
    document.getElementById("lname-error").innerHTML = lnameError;
    document.getElementById("email-error").innerHTML = emailError;
    document.getElementById("pass1-error").innerHTML = pass1Error;
    document.getElementById("pass2-error").innerHTML = pass2Error;
  
    // Prevent form submission if there are errors
    if (
      usernameError !== "" ||
      fnameError !== "" ||
      lnameError !== "" ||
      emailError !== "" ||
      pass1Error !== "" ||
      pass2Error !== ""
    ) {
      return false;
    }
    // Call the function to check if the username and email already exist
    checkUsernameEmail(username, email);
  }
  