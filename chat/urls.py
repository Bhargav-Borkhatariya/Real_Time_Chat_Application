from django.urls import path
from chat import views

urlpatterns = [
    path("", views.messages_page, name='chat'),
    path('search/', views.search_view, name='search'),
]
