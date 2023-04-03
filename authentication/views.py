import random
import string
import services.send_email as mail
from django.shortcuts import redirect, render
from django.contrib.auth.models import User
from django.http import JsonResponse
from authentication.models import ActivationOTP
from django.core.exceptions import ObjectDoesNotExist
from django.contrib.auth import login


def home(request):
    """
    Simpel function that render the base.html
    That show the home page of the web application.
    """
    return render(request, "base.html")


def signup(request):
    """
    A view function for signing up a new user.

    If the request method is POST, it processes the submitted form data,
    checks if the username or email already exists, creates a new user,
    generates an OTP, saves it to the database, and sends it to the user's email
    address for activation. Returns a JSON response indicating success.

    If the request method is GET, it renders the signup template.

    Args:
        request: An HttpRequest object that contains the request data.

    Returns:
        A JSON response or a rendered template.
    """
    if request.method == "POST":
        # Get form values
        username = request.POST["username"]
        email = request.POST["email"]
        fname = request.POST["fname"]
        lname = request.POST["lname"]
        pass1 = request.POST["pass1"]

        # Check if username or email already exists
        username_exists = User.objects.filter(username=username).exists()
        email_exists = User.objects.filter(email=email).exists()

        if username_exists or email_exists:
            # Return JSON response with error message
            return JsonResponse(
                {"username_exists": username_exists, "email_exists": email_exists}
            )

        # Create user
        user = User.objects.create_user(
            username, email, pass1, first_name=fname, last_name=lname
        )
        user.is_active = False
        user.save()

        # Generate OTP and save to the database
        otp = random.randint(100000, 999999)
        ActivationOTP.objects.create(user=user, otp=otp)

        # Send activation OTP email to user
        mail.send_activation_otp_email(user, otp)

        # Return JSON response indicating success
        return JsonResponse({"success": True})
    else:
        # Render the signup template
        return render(request, "signup.html")


def sendotp(request):
    """
    This view sends an activation OTP email to a user's email address.

    Args:
        request (HttpRequest): The HTTP request object containing the email to send the OTP to.

    Returns:
        A JsonResponse indicating if the resend was successful.
    """
    # Get email from the request parameters
    email = request.GET.get("email")

    if email:
        # Get the user associated with the email
        users = User.objects.filter(email=email)
        user = users.first()

        # Delete any existing activation OTP entry
        Activationotp = ActivationOTP.objects.filter(user=user)
        if Activationotp:
            Activationotp.delete()

        # Generate random OTP
        otp = random.randint(100000, 999999)

        # Send email with OTP to the user
        mail.send_activation_otp_email(user, otp)

        # Save OTP to activation entry
        Activationotp = ActivationOTP(user=user, otp=otp)
        Activationotp.save()

        return JsonResponse({"resend": True})


def otpverify(request):
    """
    View function for verifying the OTP entered by the user during account activation.

    If the user submits a valid OTP, the associated User object's is_active field is set to True,
    thus activating the user's account.

    If the user submits an invalid OTP, an error response is returned.

    If the request method is GET, the OTP verification form is rendered.

    Args:
        request: HttpRequest object representing the incoming request

    Returns:
        If the request method is POST and the OTP entered by the user is valid,
        a JsonResponse object with a success message.

        If the request method is POST and the OTP entered by the user is invalid,
        a JsonResponse object with an error message.

        If the request method is GET, a rendered HTML template for the OTP verification form.
    """
    if request.method == "POST":
        # Get form values
        otp = request.POST.get("otp")

        # Fetch user by OTP
        try:
            user_activation_otp = ActivationOTP.objects.get(otp=otp)
        except ObjectDoesNotExist:
            # If no user activation entry with the provided OTP is found, return an error response
            return JsonResponse({"success": False})

        # Get the user associated with the user activation entry
        user = user_activation_otp.user

        # Update the activation status of the ActivationOTP object and the associated User object
        user.is_active = True
        user.save()
        user_activation_otp.save()

        # Return success response with user activation status update
        return JsonResponse({"success": True})
    else:
        # Show the verification form
        return render(request, "otp_verify.html")


def signin(request):
    """
    View for user sign in.

    If the request method is POST, it checks the entered credentials
    and returns a JSON response indicating the status of the login attempt.
    If the credentials are correct, but the user's account is not yet activated,
    the response indicates that the account is inactive and the user needs to activate it.
    If the credentials are incorrect, the response indicates that the password is incorrect.
    If the user is not found, the response indicates that the user was not found.
    If the request method is not POST, it renders the sign in page.

    :param request: The HTTP request.
    :return: The HTTP response.
    """
    if request.method == "POST":
        # Get form values
        username = request.POST.get("username")
        password = request.POST.get("password")

        # Find user by username
        users = User.objects.filter(username=username)
        user = users.first()

        # Check if user exists and password is correct
        if user is not None:
            if user.check_password(password):
                # Check if user is activated
                if user.is_active:
                    login(request, user)
                    return JsonResponse({'success': True})
                else:
                    return JsonResponse({"notactive": True})
            else:
                return JsonResponse({"wrongpass": True})
        else:
            return JsonResponse({"usernotfound": True})

    # Render the sign in page
    return render(request, "signin.html")


def forgetpass(request):
    """
    View for handling the 'forget password' functionality.
    Sends an email to the user's email address containing a new randomly generated password.

    Returns:
        Rendered HTML template if request method is GET.
        JsonResponse with success response if request method is POST and password reset email sent successfully.
        JsonResponse with error response if request method is POST and user not found with provided email.
    """
    if request.method == "POST":
        # Get the email from the form data
        email = request.POST.get("email")

        # Check if user with given email exists
        user = User.objects.filter(email=email).first()
        if not user:
            return JsonResponse({"usernotfound": True})

        # Generate new password
        new_password = "".join(
            random.choices(string.ascii_letters + string.digits, k=10)
        )

        # Update user's password
        user.set_password(new_password)
        user.save()

        # Send forget password email.
        mail.send_forget_password_email(user, new_password)

        # Return success response
        return JsonResponse({"success": True})

    # If request method is GET, show the forget password form
    return render(request, "forgetpass.html")
