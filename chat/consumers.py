# import the json module
import json

# import other necessary modules
from channels.consumer import AsyncConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model

from chat.models import Thread, ChatMessage

# get the user model for the current Django project
User = get_user_model()


# create a consumer that handles WebSocket connections
class ChatConsumer(AsyncConsumer):
    # handle WebSocket connections
    async def websocket_connect(self, event):
        # print a message when a client connects
        print("connected", event)

        # get the current user from the request scope
        user = self.scope["user"]

        # create a chat room name based on the user's ID
        chat_room = f"user_chatroom_{user.id}"

        # store the chat room name for later use
        self.chat_room = chat_room

        # add the client's channel to the chat room group
        await self.channel_layer.group_add(chat_room, self.channel_name)

        # accept the WebSocket connection
        await self.send({"type": "websocket.accept"})

    # handle incoming WebSocket messages
    async def websocket_receive(self, event):
        # print a message when a message is received
        print("receive", event)

        # parse the incoming message as JSON
        received_data = json.loads(event["text"])

        # extract message data from the JSON object
        msg = received_data.get("message")
        sent_by_id = received_data.get("sent_by")
        send_to_id = received_data.get("send_to")
        thread_id = received_data.get("thread_id")

        # check for errors in the message data
        if not msg:
            print("Error:: empty message")
            return False
        sent_by_user = await self.get_user_object(sent_by_id)
        send_to_user = await self.get_user_object(send_to_id)
        thread_obj = await self.get_thread(thread_id)
        if not sent_by_user:
            print("Error:: sent by user is incorrect")
        if not send_to_user:
            print("Error:: send to user is incorrect")
        if not thread_obj:
            print("Error:: Thread id is incorrect")

        # create a ChatMessage object from the message data
        await self.create_chat_message(thread_obj, sent_by_user, msg)

        # create a response object to send to the recipient
        other_user_chat_room = f"user_chatroom_{send_to_id}"
        self_user = self.scope["user"]
        response = {"message": msg, "sent_by": self_user.id, "thread_id": thread_id}

        # send the response to the recipient's chat room
        await self.channel_layer.group_send(
            other_user_chat_room, {"type": "chat_message", "text": json.dumps(response)}
        )

        # send the response to the sender's chat room
        await self.channel_layer.group_send(
            self.chat_room, {"type": "chat_message", "text": json.dumps(response)}
        )

    # handle WebSocket disconnections
    async def websocket_disconnect(self, event):
        # print a message when a client disconnects
        print("disconnect", event)

    # handle incoming chat messages
    async def chat_message(self, event):
        # print a message when a chat message is received
        print("chat_message", event)

        # send the chat message to the client
        await self.send({"type": "websocket.send", "text": event["text"]})

    @database_sync_to_async
    def get_user_object(self, user_id):
        """
        This function queries the database to retrieve a User object based on a user_id.
        It is wrapped with database_sync_to_async so it can be called asynchronously.
        It returns a User object if it exists, otherwise it returns None

        This decorator is used to wrap a synchronous function with an asynchronous function.
        It creates an asynchronous version of the function that can be used inside an async function.
        It is used to execute a synchronous database query inside an async function.
        It takes a synchronous function as an argument and returns an asynchronous version of that function.
        """
        qs = User.objects.filter(id=user_id)
        if qs.exists():
            obj = qs.first()
        else:
            obj = None
        return obj

    @database_sync_to_async
    def get_thread(self, thread_id):
        """
        This function queries the database to retrieve a Thread object based on a thread_id.
        It is wrapped with database_sync_to_async so it can be called asynchronously.
        It returns a Thread object if it exists, otherwise it returns None.
        """
        qs = Thread.objects.filter(id=thread_id)
        if qs.exists():
            obj = qs.first()
        else:
            obj = None
        return obj

    @database_sync_to_async
    def create_chat_message(self, thread, user, msg):
        """
        This function creates a new ChatMessage object and saves it to the database.
        It is wrapped with database_sync_to_async so it can be called asynchronously.
        It takes a Thread object, a User object, and a message string as arguments.
        """
        ChatMessage.objects.create(thread=thread, user=user, message=msg)
