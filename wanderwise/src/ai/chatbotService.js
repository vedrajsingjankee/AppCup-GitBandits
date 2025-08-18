const API_KEY = 'API-KEY-HERE'; // Replace with your Gemini API key
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
    // Gemini's response structure
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
    return reply || "Hi, I'm WanderWise! How can I help you plan your trip?";
  } catch (error) {
    console.error('Error communicating with Gemini:', error);
    return "Sorry, WanderWise couldn't get a response.";
  }
}