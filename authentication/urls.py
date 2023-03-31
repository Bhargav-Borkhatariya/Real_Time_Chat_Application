from authentication import views
from django.urls import path, include

urlpatterns = [
    path("", views.home, name='home'),
    path("signup", views.signup, name='signup'),
    path("otpverify", views.otpverify, name='otpverify'),
    path("sendotp", views.sendotp, name='sendotp'),
    path("signin", views.signin, name='signin'),
    path("forgetpass", views.forgetpass, name='forgetpass'),
    path("chat", include("chat.urls")),
]
