# Import required modules and models
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.shortcuts import render
from django.contrib.auth import get_user_model
from django.db.models import Q
from chat.models import Thread

# Get the User model
User = get_user_model()


# Decorate the views with login_required decorator
@login_required
def messages_page(request):
    # Get all the threads by the current user, prefetch chat messages, and order by timestamp
    threads = (
        Thread.objects.by_user(user=request.user)
        .prefetch_related("chatmessage_thread")
        .order_by("timestamp")
    )
    context = {"Threads": threads}
    # Render the template with threads as the context
    return render(request, "chat/messages.html", context)


@login_required
def search_view(request):
    # Get the search query parameter and the current user
    query = request.GET.get("searchQuery")
    user = request.user
    try:
        # Try to get the user with the given query
        found_user = User.objects.get(username=query)
    except User.DoesNotExist:
        return JsonResponse({"searchResults": []})

    if not found_user.is_active:
        # If the found user is not active, return a response with the message that the user is not currently active
        response = {
            "searchResults": [{"id": found_user.id, "username": found_user.username}],
            "threadId": None,
            "message": "The user is not currently active.",
        }
        return JsonResponse(response)

    if found_user == user:
        # If the found user is the same as the current user, return a response with the message that you cannot start a chat with yourself
        response = {
            "searchResults": [{"id": user.id, "username": user.username}],
            "threadId": None,
            "message": "You cannot start a chat with yourself!",
        }
        return JsonResponse(response)

    # Filter threads by user with the given query as first or second person
    thread = Thread.objects.by_user(user=user).filter(
        Q(first_person=found_user) | Q(second_person=found_user)
    )
    if thread.exists():
        # If the thread already exists, return a response with the message that the user is already in your list
        thread = thread.first()
        response = {
            "searchResults": [{"id": found_user.id, "username": found_user.username}],
            "threadId": thread.id,
            "message": "Use is already in your List.",
        }
    else:
        # If the thread does not exist, create a new thread
        new_thread = Thread.objects.create(first_person=user, second_person=found_user)
        if new_thread:
            # If the new thread is created, return a response with the new thread id and success status
            response = {
                "searchResults": [
                    {"id": found_user.id, "username": found_user.username}
                ],
                "threadId": new_thread.id,
                "success": True,
            }
        else:
            # If the new thread is not created, return a response with the message that the chat thread creation has failed
            response = {
                "searchResults": [
                    {"id": found_user.id, "username": found_user.username}
                ],
                "threadId": None,
                "message": "Failed to create chat thread. Please try again later.",
                "success": False,
            }

    return JsonResponse(response)