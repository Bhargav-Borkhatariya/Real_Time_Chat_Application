import random
import services.send_email as mail
from django.shortcuts import render
from django.contrib.auth.models import User
from django.http import JsonResponse
from authentication.models import ActivationOTP


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
        pass2 = request.POST['pass2']
        
        # Check if username or email already exists
        if User.objects.filter(username=username).exists():
            return JsonResponse({'success': False, 'message': 'Username already exists'})
        elif User.objects.filter(email=email).exists():
            return JsonResponse({'success': False, 'message': 'Email already exists'})

        # Validate form data
        if pass1 != pass2:
            return JsonResponse({'success': False, 'message': 'Passwords do not match'})
        if len(pass1) < 6:
            return JsonResponse({'success': False, 'message': 'Password must be at least 6 characters'})
        
        # Create user
        user = User.objects.create_user(username, email, pass1, first_name=fname, last_name=lname)
        user.is_active = False
        user.save()
        
        # Generate OTP and save to the database
        otp = random.randint(100000, 999999)
        ActivationOTP.objects.create(user=user, otp=otp)

        # Send activation OTP email to user
        mail.send_activation_otp_email(user, otp)

        # Show OTP verification field in registration page
        label = f"A verification OTP has been sent to {email}. Please enter it below to activate your account."
        return render(request, "signup.html", {"label": label})

        return JsonResponse({'success': True, 'message': 'Registration successful'})
    
    return render(request, 'registration.html')