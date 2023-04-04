// Selecting DOM elements using jQuery
let input_message = $('#input-message')
let message_body = $('.msg_card_body')
let send_message_form = $('#send-message-form')
const USER_ID = $('#logged-in-user').val()

// Setting up WebSocket endpoint
let loc = window.location
let wsStart = 'ws://'

// Checking if protocol is HTTPS, if yes then using WSS (secure WebSocket)
if (loc.protocol === 'https') {
    wsStart = 'wss://'
}

let endpoint = wsStart + loc.host + loc.pathname

// Creating WebSocket object
var socket = new WebSocket(endpoint)

// Executing code block when WebSocket connection is established
socket.onopen = async function (e) {
    console.log('open', e)

    // Handling form submission when Send button is clicked
    send_message_form.on('submit', function (e) {
        e.preventDefault()

        // Getting message, recipient user ID and thread ID from the form
        let message = input_message.val()
        let send_to = get_active_other_user_id()
        let thread_id = get_active_thread_id()

        // Creating message data object
        let data = {
            'message': message,
            'sent_by': USER_ID,
            'send_to': send_to,
            'thread_id': thread_id
        }

        // Converting data object to JSON and sending to server via WebSocket
        data = JSON.stringify(data)
        socket.send(data)

        // Resetting the form after sending message
        $(this)[0].reset()
    })
}

// Define the onmessage event listener for the WebSocket
socket.onmessage = async function (e) {
    console.log('message', e)

    // Parse the received data
    let data = JSON.parse(e.data)
    let message = data['message']
    let sent_by_id = data['sent_by']
    let thread_id = data['thread_id']

    // Call the newMessage function to display the received message in the chat window
    newMessage(message, sent_by_id, thread_id)
}

// Define the onerror event listener for the WebSocket
socket.onerror = async function (e) {
    console.log('error', e)
}

// Define the onclose event listener for the WebSocket
socket.onclose = async function (e) {
    console.log('close', e)
}
function newMessage(message, sent_by_id, thread_id) {
    // check if message is not empty
    if ($.trim(message) === '') {
        return false;
    }

    // declare message element and chat id
    let message_element;
    let chat_id = 'chat_' + thread_id

    // get current date and time in desired format
    const now = new Date();
    const options = {
        day: '2-digit',
        weekday: 'short',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    };
    const dateTimeString = now.toLocaleString('en-US', options).replace(',', '');

    // check if message is sent by the user or other user
    if (sent_by_id == USER_ID) {
        message_element = `
            <div class="d-flex mb-4 replied">
                <div class="msg_cotainer_send">
                    ${message}</br>
                    <span class="msg_time_send">${dateTimeString}</span>
                </div>
            </div>
        `
    } else {
        message_element = `
           <div class="d-flex mb-4 received">
              <div class="msg_cotainer">
                 ${message}</br>
              <span class="msg_time_send">${dateTimeString}</span>
              </div>
           </div>
        `
    }

    // get message body element and append new message element to it
    let message_body = $('.messages-wrapper[chat-id="' + chat_id + '"] .msg_card_body')
    message_body.append($(message_element))

    // scroll to the bottom of the message body
    message_body.animate({
        scrollTop: $(document).height()
    }, 100);

    // clear the input message field
    input_message.val(null);
}


// Add a click event listener to each contact list item
$('.contact-li').on('click', function () {
    // Remove 'active' class from currently active contact and add it to clicked contact
    $('.contacts .active').removeClass('active')
    $(this).addClass('active')

    // Get the chat ID of the clicked contact and find the corresponding message wrapper
    let chat_id = $(this).attr('chat-id')
    $('.messages-wrapper.is_active').removeClass('is_active')
    $('.messages-wrapper[chat-id="' + chat_id + '"]').addClass('is_active')
})

// Function to get the ID of the other user in the active conversation
function get_active_other_user_id() {
    let other_user_id = $('.messages-wrapper.is_active').attr('other-user-id') // Get the value of the 'other-user-id' attribute of the active messages-wrapper
    other_user_id = $.trim(other_user_id) // Remove any whitespace from the ID
    return other_user_id // Return the ID
}

// Function to get the ID of the active conversation thread
function get_active_thread_id() {
    let chat_id = $('.messages-wrapper.is_active').attr('chat-id') // Get the value of the 'chat-id' attribute of the active messages-wrapper
    if (typeof chat_id === 'undefined') { // If the chat_id is undefined, return null
        return null;
    }
    let thread_id = chat_id.replace('chat_', '') // Remove the 'chat_' prefix from the chat_id to get the thread_id
    return thread_id // Return the thread_id
}

// Add event listener for Enter key in search bar
document.querySelector('.search').addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
        event.preventDefault(); // prevent default form submission
        search(); // call search function
    }
});

// Add event listener for click on search button
document.querySelector('.search_btn').addEventListener('click', function () {
    search(); // call search function
});

// Define function to handle search
function search() {
    // Get the search query from the input field
    var searchQuery = document.querySelector('.search').value;

    // Send a request to the server with the search query
    fetch('search/?searchQuery=' + searchQuery)
        .then(function (response) {
            // Parse the response as JSON
            return response.json();
        })
        .then(function (data) {
            // Extract the search results, message, and success status from the response
            var searchResults = data.searchResults;
            var message = data.message;
            var success = data.success;

            // If no search results were found, display an error message
            if (searchResults.length === 0) {
                Swal.fire({
                    title: 'User not found',
                    text: 'Sorry, the user is not currently active.',
                    icon: 'error'
                });
            } else {
                // If a search result was found, display a success message and redirect to the chat page with the new thread
                if (success === true) {
                    Swal.fire({
                        title: 'User found',
                        text: 'Chat thread created successfully!',
                        icon: 'success'
                    }).then(function () {
                        window.location.href = '';
                    });
                } else {
                    // If an error occurred, display an error message with the error message from the response
                    Swal.fire({
                        title: 'Error',
                        text: message,
                        icon: 'error'
                    });
                }
            }
        });
}

// Scrolls to the last message on page load
window.onload = function () {
    var lastMsg = document.getElementById("last-msg");
    lastMsg.scrollIntoView({ behavior: "smooth", block: "end", inline: "nearest" });
}

// Toggles the action menu dropdown on button click
document.addEventListener('DOMContentLoaded', function () {
    var actionMenuBtn = document.querySelector('#action_menu_btn');
    actionMenuBtn.addEventListener('mousedown', function () {
        document.querySelector('.action_menu').classList.toggle('show');
    });
});
