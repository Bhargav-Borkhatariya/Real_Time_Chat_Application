// function to handle resetting password
function resetpass() {
  // get the form and form data
  const resetForm = document.getElementById("reset-form");
  const formData = new FormData(resetForm);

  // get the email input and error message element
  const email = document.getElementById("email").value.trim()
  const emmailerror = document.getElementById("emailerror")

  // check if email is empty, if yes show error message and return false
  if (email === ""){
      emmailerror.innerHTML = "Enter Your Email."
      return false;
  }

  // send a fetch request to reset the password using the form data
  fetch(`forgetpass`, {
    method: "POST",
    body: formData
  })
  .then(response => response.json())
  .then(({ success, usernotfound })=> {
    // if password reset is successful, show success message and redirect to sign-in page
    if (success) {
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Your password has been reset.'
      }).then(() => {
        window.location.href = 'signin';
      });
    } 
    // if email is not registered, show error message and reset the form
    if (usernotfound){
      Swal.fire({
        icon: 'error',
        title: 'Email is invalid',
        text: 'This email is not registered, enter valid email.'
      });
      resetForm.reset()
    }
  })
  .catch(error => {
    // if there is an error, show error message
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Something went wrong. Please try again later.'
    });
  });
}

// get the reset form element and prevent the default form submission behavior
const resetForm = document.getElementById("reset-form");
resetForm.addEventListener('submit', function(event) {
  event.preventDefault();
});
