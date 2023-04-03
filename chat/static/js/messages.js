let input_message = $('#input-message')
let message_body = $('.msg_card_body')
let send_message_form = $('#send-message-form')
const USER_ID = $('#logged-in-user').val()

let loc = window.location
let wsStart = 'ws://'

if(loc.protocol === 'https') {
    wsStart = 'wss://'
}
let endpoint = wsStart + loc.host + loc.pathname

var socket = new WebSocket(endpoint)

socket.onopen = async function(e){
    console.log('open', e)
    send_message_form.on('submit', function (e){
        e.preventDefault()
        let message = input_message.val()
        let send_to = get_active_other_user_id()
        let thread_id = get_active_thread_id()

        let data = {
            'message': message,
            'sent_by': USER_ID,
            'send_to': send_to,
            'thread_id': thread_id
        }
        data = JSON.stringify(data)
        socket.send(data)
        $(this)[0].reset()
    })
}

socket.onmessage = async function(e){
    console.log('message', e)
    let data = JSON.parse(e.data)
    let message = data['message']
    let sent_by_id = data['sent_by']
    let thread_id = data['thread_id']
    newMessage(message, sent_by_id, thread_id)
}

socket.onerror = async function(e){
    console.log('error', e)
}

socket.onclose = async function(e){
    console.log('close', e)
}


function newMessage(message, sent_by_id, thread_id) {
	if ($.trim(message) === '') {
		return false;
	}
	let message_element;
	let chat_id = 'chat_' + thread_id
    const now = new Date();
    const options = { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' };
    const dateTimeString = now.toLocaleString('en-US', options).replace(',', '');
    if (sent_by_id == USER_ID) {
        message_element = `
            <div class="d-flex mb-4 replied">
                <div class="msg_cotainer_send">
                    ${message}</br>
                    <span class="msg_time_send">${dateTimeString}</span>
                </div>
                <div class="img_cont_msg">
                    <img src="https://images.unsplash.com/photo-1511367461989-f85a21fda167?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1931&q=80" class="rounded-circle user_img_msg">
                </div>
            </div>
        `
    }
	else{
	    message_element = `
           <div class="d-flex mb-4 received">
              <div class="img_cont_msg">
                 <img src="https://static.turbosquid.com/Preview/001292/481/WV/_D.jpg" class="rounded-circle user_img_msg">
              </div>
              <div class="msg_cotainer">
                 ${message}</br>
              <span class="msg_time_send">${dateTimeString}</span>
              </div>
           </div>
        `

    }

    let message_body = $('.messages-wrapper[chat-id="' + chat_id + '"] .msg_card_body')
	message_body.append($(message_element))
    message_body.animate({
        scrollTop: $(document).height()
    }, 100);
	input_message.val(null);
}


$('.contact-li').on('click', function (){
    $('.contacts .active').removeClass('active')
    $(this).addClass('active')

    // message wrappers
    let chat_id = $(this).attr('chat-id')
    $('.messages-wrapper.is_active').removeClass('is_active')
    $('.messages-wrapper[chat-id="' + chat_id +'"]').addClass('is_active')

})

function get_active_other_user_id(){
    let other_user_id = $('.messages-wrapper.is_active').attr('other-user-id')
    other_user_id = $.trim(other_user_id)
    return other_user_id
}

function get_active_thread_id(){
    let chat_id = $('.messages-wrapper.is_active').attr('chat-id')
    if (typeof chat_id === 'undefined') {
        return null;
    }
    let thread_id = chat_id.replace('chat_', '')
    return thread_id
}

document.querySelector('.search_btn').addEventListener('click', function() {
    var searchQuery = document.querySelector('.search').value;
    fetch('search/?searchQuery=' + searchQuery)
    .then(function(response) {
        return response.json();
    })
    document.querySelector('.search_btn').addEventListener('click', function() {
        var searchQuery = document.querySelector('.search').value;
        fetch('search/?searchQuery=' + searchQuery)
        .then(function(response) {
            return response.json();
        })
        .then(function(data) {
            var searchResults = data.searchResults;
            if (searchResults.length === 0) {
                Swal.fire({
                    title: 'User not found',
                    text: 'Sorry, we could not find a user with that username.',
                    icon: 'error'
                });
            } else {
                var threadId = data.threadId;
                var chatMessages = data.chatMessages;
                Swal.fire({
                    title: 'User found',
                    text: 'A chat thread created.', 
                    icon: 'success'
                }).then(function() {
                    // Redirect to the chat page with the existing thread
                    window.location.href = '';
                });
            }
        });
    });      
});



