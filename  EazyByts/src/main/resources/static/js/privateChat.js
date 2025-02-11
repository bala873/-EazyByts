'use strict';

const usernamePage = document.querySelector('#username-page');
const chatPage = document.querySelector('#chat-page');
const usernameForm = document.querySelector('#usernameForm');
const messageForm = document.querySelector('#messageForm');
const messageInput = document.querySelector('#message');
const connectingElement = document.querySelector('.connecting');
const chatArea = document.querySelector('#chat-messages');
const logout = document.querySelector('#logout');

let stompClient = null;
let nickname = null;
let fullname = null;
let selectedUserId = null;

function connect(event) {
    event.preventDefault();
    nickname = document.querySelector('#nickname').value.trim();
    fullname = document.querySelector('#fullname').value.trim();

    console.log(`Attempting to connect as: Nickname=${nickname}, Fullname=${fullname}`);

    if (nickname && fullname) {
        usernamePage.classList.add('hidden');
        chatPage.classList.remove('hidden');

        const socket = new SockJS('http://localhost:8080/ws');
        stompClient = Stomp.over(socket);

        stompClient.connect({}, onConnected, onError);
    } else {
        console.error("Nickname or Fullname is empty!");
    }
}

function onConnected() {
    console.log("Connected to WebSocket server ✅");

    // Subscribe to personal message queue
    stompClient.subscribe('/user/queue/messages', function(response) {
        console.log("Received message from /user/queue/messages:", JSON.parse(response.body));
        onMessageReceived(response);
    });

    // Subscribe to public chat (if applicable)
    stompClient.subscribe('/topic/public', function(response) {
        console.log("Received message from /topic/public:", JSON.parse(response.body));
        onMessageReceived(response);
    });

    // Register the connected user
    console.log(`Registering user: ${nickname}`);
    stompClient.send("/app/user.addUser",
        {},
        JSON.stringify({ nickName: nickname, fullName: fullname, status: 'ONLINE' })
    );

    document.querySelector('#connected-user-fullname').textContent = fullname;

    findAndDisplayConnectedUsers();
}

async function findAndDisplayConnectedUsers() {
    console.log("Fetching connected users...");
	try {
	        const connectedUsersResponse = await fetch('/users');
	        if (!connectedUsersResponse.headers.get('content-type').includes('application/json')) {
	            throw new Error('Invalid JSON response');
	        }
	        let connectedUsers = await connectedUsersResponse.json();

	        console.log("Received connected users:", connectedUsers);

	        connectedUsers = connectedUsers.filter(user => user.nickName !== nickname);
	        const connectedUsersList = document.getElementById('connectedUsers');
	        connectedUsersList.innerHTML = '';

	        connectedUsers.forEach(user => {
	            appendUserElement(user, connectedUsersList);
	            if (connectedUsers.indexOf(user) < connectedUsers.length - 1) {
	                const separator = document.createElement('li');
	                separator.classList.add('separator');
	                connectedUsersList.appendChild(separator);
	            }
	        });
	    } catch (error) {
	        console.error("Error fetching users:", error);
	    }
}

function appendUserElement(user, connectedUsersList) {
    const listItem = document.createElement('li');
    listItem.classList.add('user-item');
    listItem.id = user.nickName;

    const userImage = document.createElement('img');
    userImage.src = '../img/user_icon.png';
    userImage.alt = user.fullName;

    const usernameSpan = document.createElement('span');
    usernameSpan.textContent = user.fullName;

    const receivedMsgs = document.createElement('span');
    receivedMsgs.textContent = '0';
    receivedMsgs.classList.add('nbr-msg', 'hidden');

    listItem.appendChild(userImage);
    listItem.appendChild(usernameSpan);
    listItem.appendChild(receivedMsgs);

    listItem.addEventListener('click', userItemClick);

    connectedUsersList.appendChild(listItem);
}

function userItemClick(event) {
    document.querySelectorAll('.user-item').forEach(item => item.classList.remove('active'));
    messageForm.classList.remove('hidden');

    const clickedUser = event.currentTarget;
    clickedUser.classList.add('active');

    selectedUserId = clickedUser.getAttribute('id');
    console.log(`Selected user for chat: ${selectedUserId}`);

    fetchAndDisplayUserChat();

    const nbrMsg = clickedUser.querySelector('.nbr-msg');
    nbrMsg.classList.add('hidden');
    nbrMsg.textContent = '0';
}

function displayMessage(senderId, content) {
    console.log(`Displaying message from ${senderId}: "${content}"`);
    const messageContainer = document.createElement('div');
    messageContainer.classList.add('message');
    messageContainer.classList.add(senderId === nickname ? 'sender' : 'receiver');

    const message = document.createElement('p');
    message.textContent = content;
    messageContainer.appendChild(message);
    chatArea.appendChild(messageContainer);

    chatArea.scrollTop = chatArea.scrollHeight;
}

async function fetchAndDisplayUserChat() {
    console.log(`Fetching chat between ${nickname} and ${selectedUserId}...`);
    try {
        const userChatResponse = await fetch(`/messages/${nickname}/${selectedUserId}`);
        const userChat = await userChatResponse.json();
        chatArea.innerHTML = '';
        userChat.forEach(chat => {
            displayMessage(chat.senderId, chat.content);
        });
    } catch (error) {
        console.error("Error fetching user chat:", error);
    }
}

function onError(error) {
    console.error("WebSocket Connection Error:", error);
    connectingElement.textContent = 'Could not connect to WebSocket server. Please refresh this page to try again!';
    connectingElement.style.color = 'red';
}

function sendMessage(event) {
    event.preventDefault();
    const messageContent = messageInput.value.trim();

    if (messageContent && stompClient) {
        console.log(`Sending message: "${messageContent}" to ${selectedUserId}`);

        const chatMessage = {
            senderId: nickname,
            recipientId: selectedUserId,
            content: messageContent,
            timestamp: new Date()
        };

        stompClient.send("/app/chat", {}, JSON.stringify(chatMessage));
        displayMessage(nickname, messageContent);
        messageInput.value = '';
    } else {
        console.warn("Message is empty or WebSocket client is not connected.");
    }
}

async function onMessageReceived(payload) {
    console.log("Processing received message:", payload);
    await findAndDisplayConnectedUsers();

    try {
        const message = JSON.parse(payload.body);
        console.log("Parsed message:", message);

        if (selectedUserId && selectedUserId === message.senderId) {
            displayMessage(message.senderId, message.content);
        }

        const notifiedUser = document.querySelector(`#${message.senderId}`);
        if (notifiedUser && !notifiedUser.classList.contains('active')) {
            const nbrMsg = notifiedUser.querySelector('.nbr-msg');
            nbrMsg.classList.remove('hidden');
            nbrMsg.textContent = parseInt(nbrMsg.textContent) + 1;
        }
    } catch (error) {
        console.error("Error processing received message:", error);
    }
}

function onLogout() {
    console.log(`Logging out user: ${nickname}`);
    stompClient.send("/app/user.disconnectUser",
        {},
        JSON.stringify({ nickName: nickname, fullName: fullname, status: 'OFFLINE' })
    );
    window.location.reload();
}

usernameForm.addEventListener('submit', connect, true);
messageForm.addEventListener('submit', sendMessage, true);
logout.addEventListener('click', onLogout, true);
window.onbeforeunload = () => onLogout();
