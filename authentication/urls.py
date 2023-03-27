from authentication import views
from django.urls import path

urlpatterns = [
    path("", views.home, name='home'),
    path("signin", views.signin, name='signin'),
    path("signup", views.signup, name='signup'),
    path("signout", views.signout, name='signout'),
    path("changepassword", views.changepass, name='changepass'),
]
