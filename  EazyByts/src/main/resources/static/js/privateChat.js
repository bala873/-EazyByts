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

    debugLog("Sending user connection request...");
    stompClient.send("/app/user.addUser", {}, JSON.stringify({ fullName: fullname, status: 'ONLINE' }));

    document.querySelector('#connected-user-fullname').textContent = fullname;
    findAndDisplayConnectedUsers();
}

/**
 * Fetch connected users and display them
 */
async function findAndDisplayConnectedUsers() {
    debugLog("Fetching connected users...");
    try {
        const response = await fetch('/users');
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

        let connectedUsers = await response.json();
        debugLog("Connected users received:", connectedUsers);

        connectedUsers = connectedUsers.filter(user => user.fullName !== fullname);
        const connectedUsersList = document.getElementById('connectedUsers');
        connectedUsersList.innerHTML = '';

        connectedUsers.forEach(user => appendUserElement(user, connectedUsersList));
    } catch (error) {
        debugLog("Error fetching users", error);
    }
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
    debugLog(`Displaying message from ${senderId}: ${content}`);

    const messageContainer = document.createElement('div');
    messageContainer.classList.add('message', senderId === fullname ? 'sender' : 'receiver');

    const message = document.createElement('p');
    message.textContent = content;

    messageContainer.appendChild(message);
    chatArea.appendChild(messageContainer);
    chatArea.scrollTop = chatArea.scrollHeight;
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

    const messageContent = messageInput.value.trim();
    if (!messageContent) {
        alert("Cannot send an empty message.");
        return;
    }

    if (!stompClient) {
        debugLog("Message not sent: WebSocket is not connected.");
        alert("Connection lost. Please refresh and try again.");
        return;
    }

    debugLog("Sending message", { senderId: fullname, recipientId: selectedUserId, content: messageContent });

    const chatMessage = {
        senderId: fullname,
        recipientId: selectedUserId,
        content: messageContent,
        timestamp: new Date()
    };

    stompClient.send("/app/chat", {}, JSON.stringify(chatMessage));
    displayMessage(fullname, messageContent);
    messageInput.value = '';
}

/**
 * Handles received messages
 */
async function onMessageReceived(payload) {
    console.log("📩 Raw message received:", payload);

    if (!payload || !payload.body) {
        console.error("❌ Error: Received empty or invalid payload:", payload);
        return;
    }

    let message;
    try {
        message = JSON.parse(payload.body);
        console.log("✅ Parsed message:", message);
    } catch (error) {
        console.error("🚨 Error parsing message payload:", error);
        return;
    }

    try {
        await findAndDisplayConnectedUsers();
    } catch (error) {
        console.error("🚨 Error fetching connected users:", error);
    }

    if (!selectedUserId) {
        console.warn("⚠️ No user selected, skipping message display.");
        return;
    }

    if (selectedUserId === message.senderId) {
        console.log(`📬 Displaying message from ${message.senderId}...`);
        displayMessage(message.senderId, message.content);
    } else {
        console.log(`📨 New message from ${message.senderId}, but user is not active.`);
    }

    const notifiedUser = document.querySelector(`#${message.senderId}`);
    if (!notifiedUser) {
        console.warn(`⚠️ User element for ${message.senderId} not found in DOM`);
        return;
    }

    const nbrMsg = notifiedUser.querySelector('.nbr-msg');
    if (nbrMsg) {
        nbrMsg.classList.remove('hidden');
        nbrMsg.textContent = parseInt(nbrMsg.textContent) + 1;
        console.log(`🔔 Updated unread messages count for ${message.senderId}`);
    } else {
        console.warn(`⚠️ Warning: .nbr-msg element not found for ${message.senderId}`);
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
