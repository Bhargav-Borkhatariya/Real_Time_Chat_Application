const form = document.querySelector('#signinform');
// Verify form data before submission
function verifyForm() {
    const username = document.getElementById("username").value.trim();
    const pass1 = document.getElementById("password").value.trim();
    const errorUsername = document.getElementById("errorUsername");
    const errorPass = document.getElementById("errorPass");
    let valid = true;

    if (username === "") {
        errorUsername.innerHTML = 'Please enter your username.';
        valid = false;
    }
    else {
        errorUsername.innerHTML = '';
    }
    if (pass1 === "") {
        errorPass.innerHTML = 'Please enter your password.';
        valid = false;
    }
    else {
        errorPass.innerHTML = '';
    }
    return valid;
}

function siginuser() {
    const form = document.querySelector('#signinform');
    const username = document.getElementById("username");
    const pass1 = document.getElementById("password");
    const errorUsername = document.getElementById("errorUsername");
    const errorPass = document.getElementById("errorPass");

    if (username === "") {
        errorUsername.innerHTML = 'Please enter your username.';
    }
    else {
        errorUsername.innerHTML = '';
    }
    if (pass1 === "") {
        errorPass.innerHTML = 'Please enter your password.';
        return false;
    }
    else {
        errorPass.innerHTML = '';
    }

    if (verifyForm()) {
        fetch(form.action, {
            method: form.method,
            body: new FormData(form),
        })
            .then(response => response.json())
            .then(({ usernotfound, wrongpass, notactive, success }) => {
                // handle the response data
                if (usernotfound) {
                    Swal.fire({
                        icon: 'error',
                        title: 'User Not Found',
                        text: 'Your username is wrong.',
                    })
                    username.value = ""
                    return false; // Prevent form submission
                }
                if (notactive) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Your Account is not active.',
                        text: 'Active Your Account by verify otp.',
                    })
                    return false; // Prevent form submission
                }
                if (wrongpass) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Incorrect password',
                        text: 'Try again or forget password.',
                    })
                    pass1.value = ""
                    return false; // Prevent form submission
                }
                if (success) {
                    window.location.href = "/chat";
                }
            })
            .catch(error => console.error(error));
    }
}


// Listen for the form submission event
form.addEventListener('submit', function (event) {
    event.preventDefault(); // Prevent the form from submitting
    siginuser();
});


// This is function for login using google

function onSignIn(googleUser) {
    var id_token = googleUser.getAuthResponse().id_token;
    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/google-login');
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.onload = function() {
      console.log('Signed in as: ' + xhr.responseText);
      // Redirect to the dashboard page after successful login
      window.location.href = '/dashboard';
    };
    xhr.send('idtoken=' + id_token);
  }
