const chatForm = document.getElementById('chat-form');
const usuarioNameInput = document.getElementById('usuario-name');
const usuarioQueryInput = document.getElementById('usuario-query');
const chatResponseDiv = document.getElementById('chat-response');
const loadingDiv = document.getElementById('loading');
const errorDiv = document.getElementById('error');
const toggleButton = document.getElementById('dark-mode-toggle');
const chatHistoryButton = document.getElementById('history-button');
const chatHistoryElement = document.getElementById('chat-history');
const sendButton = document.getElementById('send-button');
const chatResponseElement = document.getElementById('chat-response');


const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)');
if (prefersDarkMode.matches) {
  document.body.classList.add('dark-mode');
}

// Add event listener for dark mode toggle button
toggleButton.addEventListener('click', () => {
  // Toggle dark mode class on the body element

  document.body.classList.toggle('dark-mode');
});

chatForm.addEventListener('submit', async (event) => {

  event.preventDefault(); // Prevent default form submission

  // Clear any previous errors
  errorDiv.textContent = '';
  errorDiv.style.display = 'none';

  // Show loading indicator
  loadingDiv.style.display = 'block';

  const usuarioName = usuarioNameInput.value.trim();
  const usuarioQuery = usuarioQueryInput.value.trim();

  // Moved jsonData declaration here
  const jsonData = { usuario: usuarioName, query: usuarioQuery }; // Building JSON object
  console.log(jsonData); // Building JSON object

  // Basic validation for empty query
  if (!usuarioQuery) {
    errorDiv.textContent = 'Por favor introduce una pregunta.';
    errorDiv.style.display = 'block';
    loadingDiv.style.display = 'none';
    return;
  }


  try {
    const response = await fetch('/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(jsonData), // Sending JSON data
    });

    console.log(response);


    const responseData = await response.json();

    // Handle response data
    if (responseData.error) {
      console.error("Error:", responseData.error);
      // Handle error (e.g., display an error message)
      return;}
    const chatResponseElement = document.getElementById('chat-response');
    chatResponseElement.textContent = responseData.response;
    const chatResponse = document.getElementById('chatgpt_response');
    chatResponse.textContent = responseData.response;
    chatResponse.style.display = 'block'; // Update HTML content
    
  } catch (error) {
    console.error(error);
    errorDiv.textContent = 'Ha ocurrido un error. Estamos trabajando en solucionarlo.';
    errorDiv.style.display = 'block';
  } finally {
    loadingDiv.style.display = 'none'; // Hide loading indicator regardless of success/error
  }
});
chatHistoryButton.addEventListener('click', async () => {
  try {
    const historyResponse = await fetch('/history');
    const historyData = await historyResponse.json();

    if (historyData.error) {
      console.error("Error:", historyData.error);
      return;
    }

    chatHistoryElement.textContent = "";

    if (historyData.length === 0) {
      chatHistoryElement.textContent = "No chat history found.";
    } 
    else {
      for (const historyItem of historyData) {
        const historyEntry = document.createElement('div');
        historyEntry.classList.add('chat-history-item');

        historyEntry.innerHTML = `<b>${historyItem.timestamp}</b>: ${historyItem.chatInput}`;

        chatHistoryElement.appendChild(historyEntry);
      }
    }
  } catch (error) {
    console.error("Error fetching history:", error);
  }
});

sendButton.addEventListener('click', async () => {
  // Get user input from the input field
  const chatInput = document.getElementById('chat-input');

  // Trim any leading/trailing whitespace from the input

  const userQuery = chatInput.value.trim();
  // Check if the user input is empty
  console.log(userQuery);


  if (!userQuery) {
    console.warn("Please enter a message before sending.");
    return;
  }

  chatInput.value = '';  // Clear input field after sending

  try {
    jsonData.query = userQuery;
    console.log(jsonData);
    // Update query field with user input
    await sendChat(jsonData);
  } catch (error) {
    console.error("Error sending message:", error);
  }
});

async function sendChat(jsonData) {
  try {
    const response = await fetch('/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(jsonData),
    });

    const responseData = await response.json();

    if (responseData.error) {
      console.error("Error:", responseData.error);
      return;
    }


    chatResponseElement.textContent = responseData.response;
  } 
  catch (error) 
  {
    console.error("Error fetching response:", error);
  }
}