import random
import services.send_email as mail
from django.shortcuts import redirect, render
from django.contrib.auth.models import User
from django.http import JsonResponse
from authentication.models import ActivationOTP
from django.contrib.auth import login
from django.core.exceptions import ObjectDoesNotExist

# Create your views here.
def home(request):
    """
    Simpel function that render the base.html
    That show the home page of the web application.
    """
    return render(request, "base.html")


def signup(request):
    if request.method == 'POST':
        # Get form values
        username = request.POST['username']
        email = request.POST['email']
        fname = request.POST['fname']
        lname = request.POST['lname']
        pass1 = request.POST['pass1']

        # Check if username or email already exists
        username_exists = User.objects.filter(username=username).exists()
        email_exists =  User.objects.filter(email=email).exists()

        if username_exists or email_exists:
            return JsonResponse({'username_exists': username_exists, 'email_exists': email_exists})

        # Create user
        user = User.objects.create_user(username, email, pass1, first_name=fname, last_name=lname)
        user.is_active = False
        user.save()
        
        # Generate OTP and save to the database
        otp = random.randint(100000, 999999)
        ActivationOTP.objects.create(user=user, otp=otp)

        # Send activation OTP email to user
        mail.send_activation_otp_email(user, otp)

        # Redirect to OTP verification page
        return redirect("otpverify")
    else:
        return render(request, "signup.html")


def otpverify(request):
    if request.method == 'POST':
        # Get form values
        otp = request.POST['otp']

        # Check if OTP is present in request data, if not then return an error response
        if not otp:
            return JsonResponse({
                "success": False,
                "message": "OTP is required field."})

        # Fetch user by OTP
        try:
            user_activation_otp = ActivationOTP.objects.get(otp=otp)
        except ObjectDoesNotExist:
            # If no user activation entry with the provided OTP is found, return an error response
            return JsonResponse({
                "success": False,
                "message": "OTP Verification failed"})
        # Get the user associated with the user activation entry
        user = user_activation_otp.user

        # Update the user activation status to True
        user.is_active = True
        user.save()

        # Return success response with user activation status update
        return JsonResponse({
            "status": True,
            "message": "OTP is Verified Successfully."})
    else:
        # Show the verification form
        return render(request, "otp_verify.html")