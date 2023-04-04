from django.db import models
from django.contrib.auth import get_user_model
from django.db.models import Q

User = get_user_model()

# Define a custom manager for the Thread model
class ThreadManager(models.Manager):
    def by_user(self, **kwargs):
        user = kwargs.get("user")
        # Look for threads where the user is either the first or second person
        lookup = Q(first_person=user) | Q(second_person=user)
        # Get all unique threads matching the lookup criteria
        qs = self.get_queryset().filter(lookup).distinct()
        return qs


class Thread(models.Model):
    # Define a thread with two participants
    first_person = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="thread_first_person",
    )
    second_person = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="thread_second_person",
    )
    # Keep track of when the thread was last updated
    updated = models.DateTimeField(auto_now=True)
    # Keep track of when the thread was created
    timestamp = models.DateTimeField(auto_now_add=True)

    objects = ThreadManager()

    # Ensure that there is only one thread for any given pair of participants
    class Meta:
        unique_together = ["first_person", "second_person"]


class ChatMessage(models.Model):
    # Associate each chat message with a thread
    thread = models.ForeignKey(
        Thread,
        null=True,
        blank=True,
        on_delete=models.CASCADE,
        related_name="chatmessage_thread",
    )
    # Associate each chat message with a user
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    # The actual message content
    message = models.TextField()
    # Keep track of when the message was created
    timestamp = models.DateTimeField(auto_now_add=True)
