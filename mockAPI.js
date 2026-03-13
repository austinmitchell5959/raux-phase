// mockAPI.js — Simulates connected music services

console.log("✅ mockAPI loaded");

const mockPlaylists = {
  spotify: [
    { title: "After Hours", artist: "The Weeknd", mood: "night" },
    { title: "Take Care", artist: "Drake", mood: "focus" },
    { title: "Blinding Lights", artist: "The Weeknd", mood: "energy" }
  ],
  apple: [
    { title: "Midnight Drive", artist: "Ali Gatie", mood: "chill" },
    { title: "Golden Hour", artist: "JVKE", mood: "morning" }
  ],
  soundcloud: [
    { title: "Cruise Control", artist: "DJ Drive", mood: "gym" },
    { title: "Rain Ride", artist: "LofiPilot", mood: "rainy" }
  ]
};

// Export for other scripts to use
window.mockPlaylists = mockPlaylists;
