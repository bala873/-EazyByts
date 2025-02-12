document.addEventListener('DOMContentLoaded', (event) => {
    const usernamePage = document.querySelector('#username-page');
    const chatPage = document.querySelector('#chat-page');
    const usernameForm = document.querySelector('#usernameForm');
    const messageForm = document.querySelector('#messageForm');
    const messageInput = document.querySelector('#message');
    const connectingElement = document.querySelector('.connecting');
    const chatArea = document.querySelector('#chat-messages');
    const logout = document.querySelector('#logout');

    let stompClient = null;
    let fullname = null;
    let selectedUserId = null;

    function connect(event) {
        event.preventDefault();

        fullname = document.querySelector('#fullname').value.trim();

        if (fullname) {
            usernamePage.classList.add('hidden');
            chatPage.classList.remove('hidden');

            const socket = new SockJS('/ws');
            stompClient = Stomp.over(socket);

            stompClient.connect({}, onConnected, onError);
        }
    }

    function onConnected() {
        stompClient.subscribe(`/user/${fullname}/queue/messages`, onMessageReceived);
        stompClient.subscribe(`/user/public`, onMessageReceived);

        stompClient.send("/app/user.addUser", {}, JSON.stringify({ fullName: fullname, status: 'ONLINE' }));
        document.querySelector('#connected-user-fullname').textContent = fullname;
        findAndDisplayConnectedUsers();
    }

    async function findAndDisplayConnectedUsers() {
        try {
            const connectedUsersResponse = await fetch('/users');
            if (!connectedUsersResponse.headers.get('content-type').includes('application/json')) {
                throw new Error('Invalid JSON response');
            }
            let connectedUsers = await connectedUsersResponse.json();
            console.log("Received connected users:", connectedUsers);

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
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    }

    function appendUserElement(user, connectedUsersList) {
        const listItem = document.createElement('li');
        listItem.classList.add('user-item');
        listItem.id = user.fullName;

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
        document.querySelectorAll('.user-item').forEach(item => {
            item.classList.remove('active');
        });

        messageForm.classList.remove('hidden');

        const clickedUser = event.currentTarget;
        clickedUser.classList.add('active');

        selectedUserId = clickedUser.getAttribute('id');
        fetchAndDisplayUserChat().then();

        const nbrMsg = clickedUser.querySelector('.nbr-msg');
        nbrMsg.classList.add('hidden');
        nbrMsg.textContent = '0';
    }

    function displayMessage(senderId, content) {
        const messageContainer = document.createElement('div');
        messageContainer.classList.add('message');
        if (senderId === fullname) {
            messageContainer.classList.add('sender');
        } else {
            messageContainer.classList.add('receiver');
        }
        const message = document.createElement('p');
        message.textContent = content;
        messageContainer.appendChild(message);
        chatArea.appendChild(messageContainer);
    }

    async function fetchAndDisplayUserChat() {
        try {
            const userChatResponse = await fetch(`/messages/${fullname}/${selectedUserId}`);
            if (!userChatResponse.headers.get('content-type').includes('application/json')) {
                throw new Error('Invalid JSON response');
            }
            const userChat = await userChatResponse.json();
            chatArea.innerHTML = '';
            userChat.forEach(chat => {
                displayMessage(chat.senderId, chat.content);
            });
            chatArea.scrollTop = chatArea.scrollHeight;
        } catch (error) {
            console.error("Error fetching chat messages:", error);
        }
    }

    function onError(error) {
        console.error('WebSocket connection error:', error);
        connectingElement.textContent = 'Could not connect to WebSocket server. Please refresh this page to try again!';
        connectingElement.style.color = 'red';
    }

    function sendMessage(event) {
        event.preventDefault();
        const messageContent = messageInput.value.trim();
        if (messageContent && stompClient) {
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
        chatArea.scrollTop = chatArea.scrollHeight;
    }

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
            nbrMsg.textContent = parseInt(nbrMsg.textContent) + 1;
        }
    }

    function onLogout() {
        stompClient.send("/app/user.disconnectUser", {}, JSON.stringify({ fullName: fullname, status: 'OFFLINE' }));
        window.location.reload();
    }

    usernameForm.addEventListener('submit', connect, true);
    messageForm.addEventListener('submit', sendMessage, true);
    logout.addEventListener('click', onLogout, true);
    window.onbeforeunload = () => onLogout();
});
