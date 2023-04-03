from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.shortcuts import render
from django.contrib.auth import get_user_model
from django.db.models import Q

# Create your views here.
from chat.models import Thread
User = get_user_model()


@login_required
def messages_page(request):
    threads = (
        Thread.objects.by_user(user=request.user)
        .prefetch_related("chatmessage_thread")
        .order_by("timestamp")
    )
    context = {"Threads": threads}
    return render(request, "chat/messages.html", context)


@login_required
def search_view(request):
    query = request.GET.get("searchQuery")
    user = request.user
    try:
        found_user = User.objects.get(username=query)
    except User.DoesNotExist:
        # Create a new thread if the user is not found in the database
        return JsonResponse({"searchResults": []})

    if found_user == user:
        return JsonResponse({"searchResults": []})

    thread = Thread.objects.by_user(user=user).filter(
        Q(first_person=found_user) | Q(second_person=found_user)
    )
    if thread.exists():
        thread = thread.first()
        chat_messages = thread.chatmessage_thread.all().order_by("-timestamp")[:10]
        return JsonResponse(
            {
                "searchResults": [
                    {"id": found_user.id, "username": found_user.username}
                ],
                "threadId": thread.id,
                "chatMessages": list(chat_messages.values()),
            }
        )
    else:
        # Create a new thread if no thread is found
        new_thread = Thread.objects.create(first_person=user, second_person=found_user)
        # Create a Swal alert for success or error message
        if new_thread:
            response = {
                "searchResults": [{"id": found_user.id, "username": found_user.username}],
                "threadId": new_thread.id
            }
            # Show success message using Swal
            response['message'] = 'Chat thread created successfully!'
            response['success'] = True
        else:
            # Show error message using Swal
            response = {
                "searchResults": [{"id": found_user.id, "username": found_user.username}],
                "threadId": None,
                "message": 'Failed to create chat thread. Please try again later.',
                "success": False
            }
        return JsonResponse(response)
