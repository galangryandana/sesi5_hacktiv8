const form = document.getElementById("chat-form");
const input = document.getElementById("user-input");
const chatBox = document.getElementById("chat-box");

/**
 * A simple function to convert markdown-like syntax to HTML.
 * It handles bolding (**text**) and newlines.
 * NOTE: This uses innerHTML. For a production app, consider a more
 * robust sanitizing library (like DOMPurify) to prevent X-Site-Scripting (XSS)
 * if the AI response could be manipulated to include malicious scripts.
 * @param {string} text The text to convert.
 * @returns {string} The converted HTML string.
 */
function renderSimpleMarkdown(text) {
  // Convert **bold** text to <strong> tags
  let html = text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  // Convert newlines to <br> for proper line breaks in HTML
  html = html.replace(/\n/g, "<br>");
  return html;
}

form.addEventListener("submit", async function (e) {
  e.preventDefault();

  const userMessage = input.value.trim();
  if (!userMessage) return;

  appendMessage("user", userMessage);
  input.value = "";

  // Show a temporary "Thinking..." message and get a reference to it
  const thinkingMsgElement = appendMessage("bot", "Gemini is Thinking...");

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: [{ role: "user", content: userMessage }],
      }),
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    const data = await response.json();

    if (data && data.result) {
      // Update the "Thinking..." message with the AI's reply, rendering basic markdown
      thinkingMsgElement.innerHTML = renderSimpleMarkdown(data.result);
    } else {
      // Handle case where response is ok, but no result is found
      thinkingMsgElement.textContent = "Sorry, no response received.";
    }
  } catch (error) {
    console.error("Failed to fetch chat response:", error);
    // Handle fetch/network errors or server errors
    thinkingMsgElement.textContent = "Failed to get response from server.";
  }
});

/**
 * Appends a new message to the chat box and scrolls to the bottom.
 * @param {string} sender - The sender of the message ('user' or 'bot').
 * @param {string} text - The content of the message.
 * @returns {HTMLElement} The newly created message element.
 */
function appendMessage(sender, text) {
  const msg = document.createElement("div");
  msg.classList.add("message", sender);
  msg.textContent = text;
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
  return msg; // Return the element to allow for later updates
}
