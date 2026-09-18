/* =========================================================
   AIVORA AI ASSISTANT
   STEP 4 — COMPLETE SCRIPT.JS
   ========================================================= */


/* =========================
   ELEMENTS
   ========================= */

const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const messages = document.getElementById("messages");
const welcome = document.getElementById("welcome");

const newChatBtn = document.getElementById("newChatBtn");
const headerNewChat = document.getElementById("headerNewChat");

const recentChats = document.getElementById("recentChats");

const themeBtn = document.getElementById("themeBtn");
const mobileMenu = document.getElementById("mobileMenu");
const sidebar = document.getElementById("sidebar");

const attachBtn = document.getElementById("attachBtn");
const micBtn = document.getElementById("micBtn");


/* =========================
   CHAT DATA
   ========================= */

const STORAGE_KEY = "aivoraAllChats";

let allChats = [];
let currentChatId = null;


/* =========================
   LOAD CHATS
   ========================= */

function loadChats() {

    try {

        const savedChats = localStorage.getItem(STORAGE_KEY);

        if (savedChats) {
            allChats = JSON.parse(savedChats);
        }

    } catch (error) {

        console.error(
            "Could not load chats:",
            error
        );

        allChats = [];
    }


    if (!Array.isArray(allChats)) {
        allChats = [];
    }


    renderRecentChats();
}


/* =========================
   SAVE CHATS
   ========================= */

function saveChats() {

    try {

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(allChats)
        );

    } catch (error) {

        console.error(
            "Could not save chats:",
            error
        );
    }
}


/* =========================
   CREATE NEW CHAT
   ========================= */

function createNewChat() {

    const chat = {

        id:
            Date.now().toString(),

        title:
            "New Chat",

        messages:
            [],

        createdAt:
            new Date().toISOString(),

        updatedAt:
            new Date().toISOString()
    };


    allChats.unshift(chat);

    currentChatId = chat.id;

    saveChats();

    clearChatScreen();

    renderRecentChats();

    messageInput.focus();

    closeMobileSidebar();
}


/* =========================
   GET CURRENT CHAT
   ========================= */

function getCurrentChat() {

    return allChats.find(
        chat => chat.id === currentChatId
    );
}


/* =========================
   ENSURE CHAT EXISTS
   ========================= */

function ensureCurrentChat() {

    if (currentChatId && getCurrentChat()) {
        return;
    }

    const chat = {

        id:
            Date.now().toString(),

        title:
            "New Chat",

        messages:
            [],

        createdAt:
            new Date().toISOString(),

        updatedAt:
            new Date().toISOString()
    };


    allChats.unshift(chat);

    currentChatId = chat.id;

    saveChats();

    renderRecentChats();
}


/* =========================
   CLEAR CHAT SCREEN
   ========================= */

function clearChatScreen() {

    messages.innerHTML = "";

    welcome.style.display = "block";
}


/* =========================
   LOAD SELECTED CHAT
   ========================= */

function loadChat(chatId) {

    const chat = allChats.find(
        item => item.id === chatId
    );

    if (!chat) {
        return;
    }


    currentChatId = chatId;

    messages.innerHTML = "";


    if (
        !chat.messages ||
        chat.messages.length === 0
    ) {

        welcome.style.display = "block";

    } else {

        welcome.style.display = "none";

        chat.messages.forEach(message => {

            if (message.role === "user") {

                addMessageToScreen(
                    "user",
                    message.content
                );

            } else if (message.role === "ai") {

                addAIMessageToScreen(
                    message.content
                );
            }

        });
    }


    renderRecentChats();

    messageInput.focus();

    closeMobileSidebar();
}


/* =========================
   RENDER RECENT CHATS
   ========================= */

function renderRecentChats() {

    if (!recentChats) {
        return;
    }


    recentChats.innerHTML = "";


    if (allChats.length === 0) {

        const empty = document.createElement("div");

        empty.className = "empty-chat";

        empty.textContent = "No recent chats";

        recentChats.appendChild(empty);

        return;
    }


    allChats.forEach(chat => {

        const chatItem =
            document.createElement("div");

        chatItem.className = "chat-item";


        if (chat.id === currentChatId) {
            chatItem.classList.add("active");
        }


        /* Chat icon */

        const icon =
            document.createElement("i");

        icon.className =
            "fa-regular fa-message";


        /* Chat title */

        const title =
            document.createElement("span");

        title.textContent =
            chat.title || "New Chat";


        /* Delete button */

        const deleteBtn =
            document.createElement("button");

        deleteBtn.className =
            "delete-chat-btn";

        deleteBtn.type = "button";

        deleteBtn.title =
            "Delete chat";

        deleteBtn.innerHTML =
            "🗑️";


        /* Open chat */

        chatItem.addEventListener(
            "click",
            function () {

                loadChat(chat.id);

            }
        );


        /* Delete chat */

        deleteBtn.addEventListener(
            "click",
            function (event) {

                event.stopPropagation();

                deleteChat(chat.id);

            }
        );


        chatItem.appendChild(icon);

        chatItem.appendChild(title);

        chatItem.appendChild(deleteBtn);

        recentChats.appendChild(chatItem);

    });
}


/* =========================
   DELETE CHAT
   ========================= */

function deleteChat(chatId) {

    const chatIndex =
        allChats.findIndex(
            chat => chat.id === chatId
        );


    if (chatIndex === -1) {
        return;
    }


    allChats.splice(
        chatIndex,
        1
    );


    if (currentChatId === chatId) {

        currentChatId = null;

        clearChatScreen();

    }


    saveChats();

    renderRecentChats();


    if (allChats.length === 0) {

        ensureCurrentChat();

    } else if (!currentChatId) {

        loadChat(allChats[0].id);

    }
}


/* =========================
   ADD USER MESSAGE
   ========================= */

function addMessage(
    role,
    text
) {

    ensureCurrentChat();


    addMessageToScreen(
        role,
        text
    );


    const chat =
        getCurrentChat();


    if (!chat) {
        return;
    }


    chat.messages.push({

        role:
            role,

        content:
            text,

        time:
            new Date().toISOString()
    });


    /* First user message becomes title */

    if (
        role === "user" &&
        (
            chat.title === "New Chat" ||
            !chat.title
        )
    ) {

        chat.title =
            createChatTitle(text);
    }


    chat.updatedAt =
        new Date().toISOString();


    saveChats();

    renderRecentChats();
}


/* =========================
   ADD MESSAGE TO SCREEN
   ========================= */

function addMessageToScreen(
    role,
    text
) {

    welcome.style.display = "none";


    const message =
        document.createElement("div");

    message.className =
        "message " + role;


    const content =
        document.createElement("div");

    content.className =
        "message-content";


    content.textContent =
        text;


    message.appendChild(content);

    messages.appendChild(message);


    scrollToBottom();
}


/* =========================
   ADD AI MESSAGE
   ========================= */

function addAIMessage(text) {

    ensureCurrentChat();


    addAIMessageToScreen(
        text
    );


    const chat =
        getCurrentChat();


    if (!chat) {
        return;
    }


    chat.messages.push({

        role:
            "ai",

        content:
            text,

        time:
            new Date().toISOString()
    });


    chat.updatedAt =
        new Date().toISOString();


    saveChats();

    renderRecentChats();
}


/* =========================
   AI MESSAGE SCREEN
   ========================= */

function addAIMessageToScreen(text) {

    removeTyping();

    welcome.style.display = "none";


    const message =
        document.createElement("div");

    message.className =
        "message ai";


    const content =
        document.createElement("div");

    content.className =
        "message-content";


    content.innerHTML =
        formatAIResponse(text);


    message.appendChild(content);

    messages.appendChild(message);


    addCopyButtons(content);

    scrollToBottom();
}


/* =========================
   FORMAT AI RESPONSE
   ========================= */

function formatAIResponse(text) {

    if (!text) {
        return "";
    }


    /*
       Escape HTML first so AI text
       cannot directly insert HTML.
    */

    let safeText =
        escapeHTML(text);


    /*
       Code blocks
       ```javascript
       code
       ```
    */

    safeText =
        safeText.replace(
            /```(\w+)?\n?([\s\S]*?)```/g,
            function (
                match,
                language,
                code
            ) {

                const lang =
                    language || "code";


                return `
                    <div class="code-block">

                        <div class="code-header">

                            <span>
                                ${lang}
                            </span>

                            <button
                                class="copy-code-btn"
                                type="button"
                            >
                                Copy
                            </button>

                        </div>

                        <pre><code>${code.trim()}</code></pre>

                    </div>
                `;
            }
        );


    /*
       Bold text
       **text**
    */

    safeText =
        safeText.replace(
            /\*\*(.*?)\*\*/g,
            "<strong>$1</strong>"
        );


    /*
       Convert new lines
    */

    safeText =
        safeText.replace(
            /\n/g,
            "<br>"
        );


    return safeText;
}


/* =========================
   ESCAPE HTML
   ========================= */

function escapeHTML(text) {

    const div =
        document.createElement("div");

    div.textContent =
        text;

    return div.innerHTML;
}


/* =========================
   COPY CODE BUTTON
   ========================= */

function addCopyButtons(container) {

    const buttons =
        container.querySelectorAll(
            ".copy-code-btn"
        );


    buttons.forEach(button => {

        button.addEventListener(
            "click",
            async function () {

                const code =
                    button
                        .closest(".code-block")
                        .querySelector("code")
                        .textContent;


                try {

                    await navigator.clipboard.writeText(
                        code
                    );

                    button.textContent =
                        "Copied!";


                    setTimeout(
                        function () {

                            button.textContent =
                                "Copy";

                        },
                        1500
                    );

                } catch (error) {

                    console.error(
                        "Copy failed:",
                        error
                    );

                }

            }
        );

    });
}


/* =========================
   CREATE CHAT TITLE
   ========================= */

function createChatTitle(text) {

    let title =
        text.trim();


    if (title.length > 30) {

        title =
            title.substring(
                0,
                30
            ) + "...";
    }


    return title || "New Chat";
}


/* =========================
   TYPING INDICATOR
   ========================= */

function showTyping() {

    removeTyping();


    const message =
        document.createElement("div");

    message.className =
        "message ai";

    message.id =
        "typingMessage";


    const typing =
        document.createElement("div");

    typing.className =
        "typing-message";


    for (
        let i = 0;
        i < 3;
        i++
    ) {

        const dot =
            document.createElement("span");

        dot.className =
            "typing-dot";

        typing.appendChild(dot);
    }


    message.appendChild(typing);

    messages.appendChild(message);


    scrollToBottom();
}


/* =========================
   REMOVE TYPING
   ========================= */

function removeTyping() {

    const typing =
        document.getElementById(
            "typingMessage"
        );


    if (typing) {
        typing.remove();
    }
}


/* =========================
   SEND MESSAGE TO BACKEND
   ========================= */

async function sendMessage() {

    const text =
        messageInput.value.trim();


    if (!text) {
        return;
    }


    /* Show user message */

    addMessage(
        "user",
        text
    );


    /* Clear input */

    messageInput.value =
        "";

    messageInput.style.height =
        "auto";


    /* Disable send button */

    sendBtn.disabled =
        true;


    /* Show typing */

    showTyping();


    try {

        /*
           Aivora frontend sends the
           message to our Python backend.
        */

        const response =
            await fetch(
                "http://127.0.0.1:5000/chat",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({
                            message: text
                        })
                }
            );


        let data;


        try {

            data =
                await response.json();

        } catch (jsonError) {

            throw new Error(
                "Backend returned an invalid response."
            );
        }


        if (!response.ok) {

            throw new Error(
                data.reply ||
                "Backend error: " +
                response.status
            );
        }


        const aiReply =
            data.reply;


        if (
            !aiReply ||
            !aiReply.trim()
        ) {

            throw new Error(
                "AI returned an empty response."
            );
        }


        /* Show real AI response */

        addAIMessage(
            aiReply
        );


    } catch (error) {

        console.error(
            "Aivora Error:",
            error
        );


        removeTyping();


        addAIMessage(
            "Aivora backend se connect nahi ho pa raha. Please check karo ki Python server (python app.py) chal raha hai aur .env mein API key sahi hai."
        );
    }


    /* Enable send button */

    sendBtn.disabled =
        false;


    messageInput.focus();
}


/* =========================
   ENTER TO SEND
   ========================= */

messageInput.addEventListener(
    "keydown",
    function (event) {

        if (
            event.key === "Enter" &&
            !event.shiftKey
        ) {

            event.preventDefault();

            sendMessage();
        }

    }
);


/* =========================
   AUTO RESIZE TEXTAREA
   ========================= */

messageInput.addEventListener(
    "input",
    function () {

        this.style.height =
            "auto";


        this.style.height =
            Math.min(
                this.scrollHeight,
                150
            ) + "px";
    }
);


/* =========================
   SEND BUTTON
   ========================= */

sendBtn.addEventListener(
    "click",
    sendMessage
);


/* =========================
   NEW CHAT BUTTONS
   ========================= */

newChatBtn.addEventListener(
    "click",
    createNewChat
);


headerNewChat.addEventListener(
    "click",
    createNewChat
);


/* =========================
   SUGGESTION CARDS
   ========================= */

const suggestionCards =
    document.querySelectorAll(
        ".suggestion-card"
    );


suggestionCards.forEach(
    function (card) {

        card.addEventListener(
            "click",
            function () {

                const prompt =
                    card.dataset.prompt;


                if (!prompt) {
                    return;
                }


                messageInput.value =
                    prompt;


                messageInput.style.height =
                    "auto";


                messageInput.style.height =
                    Math.min(
                        messageInput.scrollHeight,
                        150
                    ) + "px";


                messageInput.focus();

            }
        );

    }
);


/* =========================
   THEME
   ========================= */

function loadTheme() {

    const savedTheme =
        localStorage.getItem(
            "aivoraTheme"
        );


    if (savedTheme === "dark") {

        document.body.classList.add(
            "dark-mode"
        );

        updateThemeIcon(true);

    } else {

        document.body.classList.remove(
            "dark-mode"
        );

        updateThemeIcon(false);
    }
}


function toggleTheme() {

    const isDark =
        document.body.classList.toggle(
            "dark-mode"
        );


    localStorage.setItem(
        "aivoraTheme",
        isDark ? "dark" : "light"
    );


    updateThemeIcon(
        isDark
    );
}


function updateThemeIcon(isDark) {

    if (!themeBtn) {
        return;
    }


    const icon =
        themeBtn.querySelector("i");


    if (!icon) {
        return;
    }


    if (isDark) {

        icon.className =
            "fa-solid fa-sun";

        themeBtn.title =
            "Switch to light mode";

    } else {

        icon.className =
            "fa-solid fa-moon";

        themeBtn.title =
            "Switch to dark mode";
    }
}


themeBtn.addEventListener(
    "click",
    toggleTheme
);


/* =========================
   MOBILE SIDEBAR
   ========================= */

mobileMenu.addEventListener(
    "click",
    function () {

        sidebar.classList.toggle(
            "open"
        );
    }
);


function closeMobileSidebar() {

    if (
        window.innerWidth <= 700
    ) {

        sidebar.classList.remove(
            "open"
        );
    }
}


/* =========================
   ATTACHMENT BUTTON
   ========================= */

attachBtn.addEventListener(
    "click",
    function () {

        alert(
            "File upload feature will be added in the next version."
        );

    }
);


/* =========================
   VOICE INPUT
   ========================= */

let recognition = null;


function setupVoiceRecognition() {

    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;


    if (!SpeechRecognition) {

        micBtn.addEventListener(
            "click",
            function () {

                alert(
                    "Voice input is not supported in this browser."
                );

            }
        );

        return;
    }


    recognition =
        new SpeechRecognition();


    recognition.lang =
        "en-IN";

    recognition.continuous =
        false;

    recognition.interimResults =
        false;


    recognition.onstart =
        function () {

            micBtn.classList.add(
                "recording"
            );

        };


    recognition.onend =
        function () {

            micBtn.classList.remove(
                "recording"
            );

        };


    recognition.onerror =
        function (event) {

            console.error(
                "Speech recognition error:",
                event.error
            );

            micBtn.classList.remove(
                "recording"
            );
        };


    recognition.onresult =
        function (event) {

            const transcript =
                event.results[0][0].transcript;


            messageInput.value =
                transcript;


            messageInput.style.height =
                "auto";


            messageInput.style.height =
                Math.min(
                    messageInput.scrollHeight,
                    150
                ) + "px";
        };


    micBtn.addEventListener(
        "click",
        function () {

            try {

                recognition.start();

            } catch (error) {

                console.log(
                    "Recognition already running."
                );

            }

        }
    );
}


/* =========================
   SCROLL TO BOTTOM
   ========================= */

function scrollToBottom() {

    setTimeout(
        function () {

            const chatArea =
                document.getElementById(
                    "chatArea"
                );


            chatArea.scrollTop =
                chatArea.scrollHeight;

        },
        50
    );
}


/* =========================
   INITIALIZE AIVORA
   ========================= */

function initializeAivora() {

    loadTheme();

    loadChats();

    setupVoiceRecognition();


    /*
       If there are existing chats,
       open the latest one.
    */

    if (allChats.length > 0) {

        loadChat(
            allChats[0].id
        );

    } else {

        ensureCurrentChat();

    }


    messageInput.focus();
}


/* =========================
   START
   ========================= */

initializeAivora();