// Get email from URL and set it as the innerHTML of the element with ID 'email'
const email = decodeURIComponent(new URLSearchParams(window.location.search).get('email'));
document.getElementById('email').innerHTML = email;

// Get form and error/success message elements
const otpForm = document.querySelector('#otpForm');
const otpError = document.getElementById("otp-error");
const otpSuccess = document.getElementById("otp-success");

// Prevent default form submission on submit event
otpForm.addEventListener('submit', function(event) {
  event.preventDefault();
});

// Verify OTP function
function verify() {
  // Get OTP input fields, concatenate the input values and set it to OTP input field
  const otpInputFields = otpForm.querySelectorAll('input[type="text"]');
  const otpInput = otpForm.querySelector('#otp');
  const otpValue = Array.from(otpInputFields).map(function(inputField) {
    return inputField.value;
  }).join('');
  otpInput.value = otpValue;
  
  // Validate OTP field
  if (!otpValue) {
    otpSuccess.innerHTML = "";
    otpError.innerHTML = "Please enter the OTP";
  } else {
    otpError.innerHTML = "";
    // Send OTP to server for verification
    const data = new FormData(otpForm);
    fetch(otpForm.action, {
      method: "POST",
      body: data
    })
    .then(response => response.json())
    .then(({ success}) => {
      // handle the response data
      if (!success) {
        Swal.fire({
          icon: 'error',
          title: 'OTP is invalid',
          text: 'You Entered Wrong OTP.'
        });
      } else {
        window.location.href = `signin`;
      }
    })
    .catch(error => console.error(error));
  }
}

// Resend OTP function
function resend() {
  // Send a request to server to resend OTP to the user's email
  fetch(`sendotp?email=${email}`, {
    method: 'GET'
  })
  .then(response => response.json())
  .then(resend => {
    if (resend) {
      otpError.innerHTML = "";
      otpSuccess.innerHTML = "OTP sent successfully.";
    }
  })
  .catch(error => {
    console.error('There was a problem sending the OTP:', error);
  });
}
