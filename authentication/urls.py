from authentication import views
from django.urls import path

urlpatterns = [
    path("", views.home, name='home'),
    path("signup", views.signup, name='signup'),
    path("otpverify", views.otpverify, name='otpverify'),
]
