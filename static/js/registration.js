// This function validates the form fields and returns a boolean indicating whether the form is valid
function validateForm() {
  // Define an array of objects containing information about the form fields
  const fields = [
    { id: "username", label: "Username" },
    { id: "fname", label: "First name" },
    { id: "lname", label: "Last name" },
    { id: "email", label: "Email" },
    { id: "pass1", label: "Password" },
    { id: "pass2", label: "Password confirmation" }
  ];

  let valid = true;

  // Loop through each field, check if it is empty, and display an error message if necessary
  fields.forEach(field => {
    const element = document.getElementById(field.id);
    const errorElement = document.getElementById(`${field.id}-error`);
    const value = element.value.trim();

    if (value === "") {
      errorElement.innerHTML = `${field.label} is required`;
      valid = false;
    } else {
      errorElement.innerHTML = "";
    }
  });

  // Email Validation
  const email = document.getElementById("email").value.trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const emailError = document.getElementById("email-error")

  if (email === "") {
    emailError.textContent = 'email is required';
    valid = false;
  } else if (!emailRegex.test(email)) {
    emailError.textContent = 'Please enter a valid email address';
    valid = false;
  } else {
    emailError.textContent = '';
  }
  

  // Check if the password fields are valid and display error messages if necessary
  const pass1 = document.getElementById("pass1").value.trim();
  const pass2 = document.getElementById("pass2").value.trim();
  const pass1Error = document.getElementById("pass1-error");
  const pass2Error = document.getElementById("pass2-error");

  if (pass1 === "") {
    pass1Error.innerHTML = "Password is required";
    valid = false;
  } else if (pass1.length < 8) {
    pass1Error.innerHTML = "Password must be at least 8 characters long";
    valid = false;
  } else {
    pass1Error.innerHTML = "";
  }

  if (pass2 === "") {
    pass2Error.innerHTML = "Please confirm your password";
    valid = false;
  } else if (pass1 !== pass2) {
    pass2Error.innerHTML = "Passwords do not match";
    valid = false;
  } else {
    pass2Error.innerHTML = "";
  }

  // Return whether the form is valid
  return valid;
}

// This function is called when the user clicks the "Sign Up" button
function signup() {
  // If the form is valid, send the data to the server
  if (validateForm()) {
    const form = document.querySelector("form");
    const data = new FormData(form);
    var usernameError = document.getElementById("username-error");
    var emailError = document.getElementById("email-error");

    // Send a request to the server to check if the username and email already exist
    fetch(form.action, {
      method: "POST",
      body: data,
    })
      .then(response => response.json())
      .then(({ username_exists, email_exists, success }) => {
        // If the username already exists, display an error message
        if (username_exists) {
          usernameError.innerHTML = "Username is already registered.";
          return false; // Prevent form submission
        }
        // If the email already exists, display an error message
        if (email_exists) {
          emailError.innerHTML = "Email is already registered.";
          return false; // Prevent form submission
        }
        // If the submission was successful, show a success message and reset the form
        if (success) {
          const email = document.getElementById("email").value;
          const url = `otpverify?email=${encodeURIComponent(email)}`;
          Swal.fire({
            icon: 'success',
            title: 'otp sent...',
            text: 'A verification OTP has been sent to email',
          }).then(() => {
            window.location.href = url;
          });
          form.reset();
        }
      });
  }
}

// get the reset form element and prevent the default form submission behavior
const form = document.querySelector("form");
form.addEventListener('submit', function(event) {
  event.preventDefault();
  signup();
});

