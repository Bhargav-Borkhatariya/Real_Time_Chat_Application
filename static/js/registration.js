function validateForm() {
  const fields = [
    { id: "username", label: "Username" },
    { id: "fname", label: "First name" },
    { id: "lname", label: "Last name" },
    { id: "email", label: "Email" },
    { id: "pass1", label: "Password" },
    { id: "pass2", label: "Password confirmation" }
  ];

  let valid = true;

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

  return valid;
}


function signup() {
  if (validateForm()) {
    const form = document.querySelector("form");
    const data = new FormData(form);
    var usernameError = document.getElementById("username-error");
    var emailError = document.getElementById("email-error");

    fetch(form.action, {
      method: "POST",
      body: data,
    })
      .then(response => response.json())
      .then(({ username_exists, email_exists, success}) => {
        if (username_exists) {
          // The username already exists, show an error message
          usernameError.innerHTML = "Username is already registered.";
          return false; // Prevent form submission
        }
        if (email_exists) {
          // The email already exists, show an error message
          emailError.innerHTML = "Email is already registered.";
          return false; // Prevent form submission
        }        
        form.reset()
      });
  }
}

