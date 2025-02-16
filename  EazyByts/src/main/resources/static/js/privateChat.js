'use strict';

// Selecting DOM elements
const usernamePage = document.querySelector('#username-page');
const chatPage = document.querySelector('#chat-page');
const usernameForm = document.querySelector('#usernameForm');
const messageForm = document.querySelector('#messageForm');
const messageInput = document.querySelector('#message');
const chatArea = document.querySelector('#chat-messages');
const logout = document.querySelector('#logout');

let stompClient = null;
let fullname = null;
let selectedUserId = null;

/**
 * Debugging Helper Function
 * Logs messages with timestamps
 */
function debugLog(message, data = null) {
    console.log(`[DEBUG ${new Date().toLocaleTimeString()}] ${message}`, data);
}

/**
 * Connect user to WebSocket
 */
function connect(event) {
    event.preventDefault();
    debugLog("Attempting to connect...");

    fullname = document.querySelector('#fullname').value.trim();
    
    if (!fullname) {
        alert("Please enter a valid username.");
        return;
    }

    usernamePage.classList.add('hidden');
    chatPage.classList.remove('hidden');

    try {
        const socket = new SockJS('http://localhost:8080/ws');
        stompClient = Stomp.over(socket);
        debugLog("WebSocket created, attempting to connect...");

        stompClient.connect({}, onConnected, onError);
    } catch (error) {
        debugLog("Error initializing WebSocket", error);
    }
}

/**
 * Handles successful WebSocket connection
 */
function onConnected() {
    debugLog("Connected to WebSocket. Subscribing to user queue...");

	stompClient.subscribe(`/user/${fullname}/queue/messages`, onMessageReceived);
	//stompClient.subscribe(`/user/public`, onMessageReceived);

    debugLog("Sending user connection request...");
    stompClient.send("/app/user.addUser", {}, JSON.stringify({ fullName: fullname, status: 'ONLINE' }));

    document.querySelector('#connected-user-fullname').textContent = fullname;
    findAndDisplayConnectedUsers();
}


/**
 * Fetch connected users and display them
 */
async function findAndDisplayConnectedUsers() {
    const connectedUsersResponse = await fetch('/users');
    let connectedUsers = await connectedUsersResponse.json();
    connectedUsers = connectedUsers.filter(user => user.fullName !== fullname);
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
}

/**
 * Creates and appends user elements to the user list
 */
function appendUserElement(user, connectedUsersList) {
    debugLog(`Appending user: ${user.fullName}`);

    const listItem = document.createElement('li');
    listItem.classList.add('user-item');
    listItem.id = user.fullName;

    const userImage = document.createElement('img');
    userImage.src = '/img/user_icon.png';
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

/**
 * Handles user selection for chat
 */
function userItemClick(event) {
    debugLog("User clicked", event.currentTarget.id);

    document.querySelectorAll('.user-item').forEach(item => item.classList.remove('active'));
    messageForm.classList.remove('hidden');

    selectedUserId = event.currentTarget.id;
    event.currentTarget.classList.add('active');

    fetchAndDisplayUserChat();

    const nbrMsg = event.currentTarget.querySelector('.nbr-msg');
    nbrMsg.classList.add('hidden');
    nbrMsg.textContent = '0';
}

/**
 * Fetch chat history between the current user and the selected user
 */
async function fetchAndDisplayUserChat() {
    debugLog(`Fetching chat with ${selectedUserId}...`);
    try {
        const response = await fetch(`/messages/${fullname}/${selectedUserId}`);
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

        const userChat = await response.json();
        debugLog("Chat messages received:", userChat);

        chatArea.innerHTML = '';
        userChat.forEach(chat => displayMessage(chat.senderId, chat.content));
    } catch (error) {
        debugLog("Error fetching chat history", error);
    }
}

/**
 * Displays a chat message in the chat area
 */
function displayMessage(senderId, content) {
    console.log(`💬 Adding message from ${senderId}: ${content}`);

    const messageContainer = document.createElement('div');
    messageContainer.classList.add('message', senderId === fullname ? 'sender' : 'receiver');

    const message = document.createElement('p');
    message.textContent = content;

    messageContainer.appendChild(message);
    chatArea.appendChild(messageContainer);
    chatArea.scrollTop = chatArea.scrollHeight;

    console.log("✅ Message displayed in real-time.");
}


/**
 * Handles WebSocket errors
 */
function onError(error) {
    debugLog("WebSocket error occurred", error);
}

/**
 * Sends a chat message
 */
function sendMessage(event) {
    event.preventDefault();

    if (!messageInput) {
        console.error("❌ Error: messageInput not found in the DOM.");
        return;
    }

    const messageContent = messageInput.value.trim();
    if (!messageContent) {
        alert("Cannot send an empty message.");
        return;
    }

    if (!stompClient || !stompClient.connected) {
        console.error("❌ Error: WebSocket is not connected.");
        alert("Connection lost. Please refresh and try again.");
        return;
    }

    if (!selectedUserId) {
        console.error("❌ Error: No recipient selected.");
        alert("Please select a user to chat with.");
        return;
    }

    const chatMessage = {
        senderId: fullname,
        recipientId: selectedUserId,
        content: messageContent,
        timestamp: new Date()
    };

    console.log("📤 Sending message via WebSocket:", chatMessage);

    try {
        stompClient.send("/app/chat", {}, JSON.stringify(chatMessage));
        console.log("✅ Message successfully sent!");

        // **Instantly Display Sent Message in Chat**
        displayMessage(fullname, messageContent);
        messageInput.value = '';
    } catch (error) {
        console.error("❌ Error sending message:", error);
        alert("Failed to send message. Please try again.");
    }
}


/**
 * Handles received messages
 */
async function onMessageReceived(payload) {
    await findAndDisplayConnectedUsers();
    console.log('Message received', payload);
    const message = JSON.parse(payload.body);
    if (selectedUserId && selectedUserId === message.senderId) {
        displayMessage(message.senderId, message.content);
        chatArea.scrollTop = chatArea.scrollHeight;
    }

    if (selectedUserId) {
        document.querySelector(`#${selectedUserId}`).classList.add('active');
    } else {
        messageForm.classList.add('hidden');
    }

    const notifiedUser = document.querySelector(`#${message.senderId}`);
    if (notifiedUser && !notifiedUser.classList.contains('active')) {
        const nbrMsg = notifiedUser.querySelector('.nbr-msg');
        nbrMsg.classList.remove('hidden');
        nbrMsg.textContent = '';
    }
}

/**
 * Handles user logout
 */
function onLogout() {
    if (stompClient) {
        debugLog("Logging out...");
        stompClient.send("/app/user.disconnectUser", {}, JSON.stringify({ fullName: fullname, status: 'OFFLINE' }));
    }
    window.location.reload();
}

// Event Listeners
usernameForm.addEventListener('submit', connect, true);
messageForm.addEventListener('submit', sendMessage, true);
logout.addEventListener('click', onLogout, true);
window.onbeforeunload = () => onLogout();
