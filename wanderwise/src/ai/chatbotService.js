const API_KEY = import.meta.env.VITE_GEMINI_API_KEY; // Correctly access the environment variable
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

export async function getChatbotResponse(message) {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: message }] }]
      }),
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await response.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
    return reply || "Hi, I'm MauriQuest! How can I help you plan your trip?";
  } catch (error) {
    console.error('Error communicating with Gemini:', error);
    return "Sorry, MauriQuest couldn't get a response.";
  }
}