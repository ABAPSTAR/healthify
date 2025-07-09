// import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
// import { getAI, getGenerativeModel, GoogleAIBackend } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-ai-logic.js";
// // Your Firebase config


// import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
// import { getAI, getGenerativeModel, GoogleAIBackend } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-ai.js';
// const firebaseConfig = {
//   apiKey: "AIzaSyCg0fj0OuMnNxuLg6P4RUuFSb3vCP5tLSg",
//   authDomain: "project-drishti-50dc7.firebaseapp.com",
//   projectId: "project-drishti-50dc7",
//   storageBucket: "project-drishti-50dc7.appspot.com",
//   messagingSenderId: "206451126266",
//   appId: "1:206451126266:web:5ce295c6661c1278d27e43",
//   measurementId: "G-67JBE12HJ5"
// };

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);

// // Initialize Gemini backend
// const ai = getAI(app, { backend: new GoogleAIBackend() });

// // Load Gemini model
// const model = getGenerativeModel(ai, { model: "gemini-2.5-flash" });

// // Function exposed to HTML's onclick
// window.askGemini = async function() {
//   const prompt = document.getElementById("ai-input").value.trim();
//   const responseBox = document.getElementById("ai-response-box");

//   if (!prompt) {
//     responseBox.innerHTML = `<p style="color:red;">Please enter a question.</p>`;
//     return;
//   }

//   responseBox.innerHTML = "<p>Thinking...</p>";

//   try {
//     const result = await model.generateContent(prompt);
//     responseBox.innerHTML = `<p>${result.response.text()}</p>`;
//   } catch (err) {
//     console.error("Gemini Error:", err);
//     responseBox.innerHTML = `<p style="color:red;">Error: ${err.message}</p>`;
//   }
// };

// gemini

const firebaseConfig = {
    apiKey: "AIzaSyCg0fj0OuMnNxuLg6P4RUuFSb3vCP5tLSg",
    authDomain: "project-drishti-50dc7.firebaseapp.com",
    projectId: "project-drishti-50dc7",
    storageBucket: "project-drishti-50dc7.appspot.com",
    messagingSenderId: "206451126266",
    appId: "1:206451126266:web:5ce295c6661c1278d27e43",
    measurementId: "G-67JBE12HJ5"
  };
  
  firebase.initializeApp(firebaseConfig);
  const db = firebase.firestore();
  
  // let currentUser = null;
  
  // Tabs
  function toggleTab(tab) {
    document.getElementById('login-form').classList.toggle('hidden', tab !== 'login');
    document.getElementById('signup-form').classList.toggle('hidden', tab !== 'signup');
    document.getElementById('login-tab').classList.toggle('active', tab === 'login');
    document.getElementById('signup-tab').classList.toggle('active', tab === 'signup');
    clearMessages();
  }
  
  // Auth
  document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    login(email, password);
  });
  
  document.getElementById('signup-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    signup(name, email, password);
  });
  
  // async function login(email, password) {
  //   try {
  //     const snapshot = await db.collection("users").where("email", "==", email).get();
  //     if (snapshot.empty) {
  //       showMessage('login-status', 'User not found.', 'error');
  //       return;
  //     }
  //     const userDoc = snapshot.docs[0];
  //     const data = userDoc.data();
  //     if (data.password !== password) {
  //       showMessage('login-status', 'Incorrect password.', 'error');
  //       return;
  //     }
  //     currentUser = { id: userDoc.id, ...data };
  //     showDashboard();
  //   } catch (error) {
  //     console.error(error);
  //     showMessage('login-status', 'Login failed.', 'error');
  //   }
  // }
  

  async function login(email, password) {
    try {
      clearMessages(); // Add this to reset messages before login attempt
  
      const snapshot = await db.collection("users").where("email", "==", email).get();
      if (snapshot.empty) {
        showMessage('login-status', 'User not found.', 'error');
        return;
      }
  
      let matchedUser = null;
      snapshot.forEach(doc => {
        const data = doc.data();
        if (data.password === password) {
          matchedUser = { id: doc.id, ...data };
        }
      });
  
      if (!matchedUser) {
        showMessage('login-status', 'Incorrect password.', 'error');
        return;
      }
  
      currentUser = matchedUser;
      loadTodayStatsIntoInputs();

      showDashboard();
    } catch (error) {
      console.error(error);
      showMessage('login-status', 'Login failed.', 'error');
    }
  }
  
  async function loadTodayStatsIntoInputs() {
    if (!currentUser) return;
  
    const today = new Date().toISOString().split("T")[0];
    try {
      const doc = await db.collection("users").doc(currentUser.id)
        .collection("stats")
        .doc(today)
        .get();
  
      if (doc.exists) {
        const { water, steps, sleep } = doc.data();
        document.getElementById('water-input').value = water || '';
        document.getElementById('steps-input').value = steps || '';
        document.getElementById('sleep-input').value = sleep || '';
      } else {
        // Clear inputs if no data exists yet
        document.getElementById('water-input').value = '';
        document.getElementById('steps-input').value = '';
        document.getElementById('sleep-input').value = '';
      }
    } catch (err) {
      console.error("Error loading today's stats: ", err);
    }
  }
  
  async function signup(name, email, password) {
    try {
      const existing = await db.collection("users").where("email", "==", email).get();
      if (!existing.empty) {
        showMessage('signup-status', 'Email already registered.', 'error');
        return;
      }
      await db.collection("users").add({
        Name: name,
        email,
        password,
        CreatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      showMessage('signup-status', 'Signup successful! Please login.', 'success');
      setTimeout(() => toggleTab('login'), 1500);
    } catch (err) {
      console.error(err);
      showMessage('signup-status', 'Signup failed.', 'error');
    }
  }
  
  function showDashboard() {
    document.querySelector('form#login-form').classList.add('hidden');
    document.querySelector('form#signup-form').classList.add('hidden');
    document.getElementById('dashboard-section').classList.remove('hidden');
    document.querySelector('.tab-container').classList.add('hidden');
  
    document.getElementById('display-name').textContent = currentUser.Name;
    document.getElementById('display-email').textContent = currentUser.email;
    document.getElementById('display-created-at').textContent =
      currentUser.CreatedAt?.toDate?.().toLocaleString() || 'Just Now';
      loadStats(); // Fetch today's stats when showing dashboard
  }
  
  // function logout() {
  //   currentUser = null;
  //   document.getElementById('dashboard-section').classList.add('hidden');
  //   document.querySelector('.tab-container').classList.remove('hidden');
  //   document.getElementById('login-form').reset();
  //   document.getElementById('signup-form').reset();
  //   toggleTab('login');
  // }
  

  function logout() {
    currentUser = null;
  
    // Clear stats UI
    document.querySelector('.health-card').innerHTML = '';
    document.querySelector('#history-table tbody').innerHTML = '';
    if (chartInstance) {
      chartInstance.destroy();
      chartInstance = null;
    }
  
    document.getElementById('dashboard-section').classList.add('hidden');
    document.querySelector('.tab-container').classList.remove('hidden');
    document.getElementById('login-form').reset();
    document.getElementById('signup-form').reset();
    toggleTab('login');
  }
  
  async function saveStats() {
    const water = document.getElementById('water-input').value;
    const steps = document.getElementById('steps-input').value;
    const sleep = document.getElementById('sleep-input').value;
  
    if (!currentUser) return;
  
    const today = new Date().toISOString().split("T")[0]; // e.g. "2025-07-08"
    try {
      await db.collection("users").doc(currentUser.id)
        .collection("stats")
        .doc(today)
        .set({ water, steps, sleep, date: today });
  
      showMessage('login-status', 'Stats updated successfully!', 'success');
      loadStats(); // Refresh UI
    } catch (err) {
      console.error(err);
      showMessage('login-status', 'Failed to save stats.', 'error');
    }
  }
  
  // async function loadStats() {
  //   const today = new Date().toISOString().split("T")[0];
  //   const statsRef = db.collection("users").doc(currentUser.id).collection("stats").doc(today);
  //   const doc = await statsRef.get();
  
  //   if (doc.exists) {
  //     const data = doc.data();
  //     document.querySelector('.health-card').innerHTML = `
  //       <h4>Today's Stats</h4>
  //       <p>Water Intake: <strong>${data.water}</strong></p>
  //       <p>Steps: <strong>${data.steps}</strong></p>
  //       <p>Sleep: <strong>${data.sleep}</strong></p>
  //     `;
  //   } else {
  //     document.querySelector('.health-card').innerHTML = `
  //       <h4>Today's Stats</h4>
  //       <p>No stats available. Please update your health data above.</p>
  //     `;
  //   }
  // }
  
  function showMessage(id, text, type = 'info') {
    const el = document.getElementById(id);
    el.textContent = text;
    el.className = `status-message status-${type}`;
    el.style.display = 'block';
    setTimeout(() => el.style.display = 'none', 4000);
  }
  
  function clearMessages() {
    document.querySelectorAll('.status-message').forEach(msg => msg.style.display = 'none');
  }
  


async function loadStats() {
  const today = new Date().toISOString().split("T")[0];
  const statsRef = db.collection("users").doc(currentUser.id).collection("stats");

  try {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 6); // Last 7 days
    const snapshot = await statsRef
      .where("date", ">=", weekAgo.toISOString().split("T")[0])
      .orderBy("date")
      .get();

    const statsList = [];
    snapshot.forEach(doc => statsList.push(doc.data()));

    // Today's Stat
    const todayData = statsList.find(stat => stat.date === today);
    if (todayData) {
      document.querySelector('.health-card').innerHTML = `
        <h4>Today's Stats</h4>
        <p>Water Intake: <strong>${todayData.water}</strong></p>
        <p>Steps: <strong>${todayData.steps}</strong></p>
        <p>Sleep: <strong>${todayData.sleep}</strong></p>
      `;
      document.getElementById('water-input').value = todayData.water;
      document.getElementById('steps-input').value = todayData.steps;
      document.getElementById('sleep-input').value = todayData.sleep;
    }

    renderHistoryTable(statsList);
    renderCharts(statsList);
  } catch (err) {
    console.error("Error loading stats:", err);
  }
}

function renderHistoryTable(data) {
  const tbody = document.querySelector('#history-table tbody');
  tbody.innerHTML = "";
  data.forEach(item => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${item.date}</td>
      <td>${item.water || '-'}</td>
      <td>${item.steps || '-'}</td>
      <td>${item.sleep || '-'}</td>
    `;
    tbody.appendChild(tr);
  });
}

function renderCharts(data) {
  const labels = data.map(d => d.date);
  const water = data.map(d => parseFloat(d.water) || 0);
  const steps = data.map(d => parseInt(d.steps) || 0);
  const sleep = data.map(d => parseFloat(d.sleep) || 0);

  const ctx = document.getElementById("chart-stats").getContext("2d");
  if (chartInstance) chartInstance.destroy();

  chartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: '💧 Water (L)',
          data: water,
          borderColor: '#4fc3f7',
          fill: false
        },
        {
          label: '🚶 Steps',
          data: steps,
          borderColor: '#81c784',
          fill: false
        },
        {
          label: '🛏️ Sleep (hrs)',
          data: sleep,
          borderColor: '#ba68c8',
          fill: false
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'bottom' }
      },
      scales: {
        y: { beginAtZero: true }
      }
    }
  });
}


import { GoogleGenerativeAI } from 'https://cdn.jsdelivr.net/npm/@google/generative-ai@0.21.0/+esm';

const API_KEY = "AIzaSyCa3Dt-xD3zZSBJUUyz4ISfjM6FW-k48BI";
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Helper: Convert markdown-style **bold** and line breaks to HTML
function formatMarkdown(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")  // bold
    .replace(/\n/g, "<br>");                            // line breaks
}

// Typing animation with HTML support
function typeEffect(container, rawText, speed = 20) {
  const formattedText = formatMarkdown(rawText);
  container.innerHTML = "";
  let i = 0;
  const span = document.createElement("span");

  container.appendChild(span);

  const interval = setInterval(() => {
    span.innerHTML = formattedText.slice(0, i);
    i++;
    if (i > formattedText.length) clearInterval(interval);
  }, speed);
}


// Main ask function
window.askGemini = async function () {
  const prompt = document.getElementById("ai-input").value.trim();
  const responseBox = document.getElementById("ai-response-box");
  const button = document.querySelector(".health-card button");

  if (!prompt) {
    responseBox.innerHTML = `<p class="error">💡 Try asking something health-related!</p>`;
    return;
  }

  button.disabled = true;
  responseBox.innerHTML = `<p class="thinking">💬 Healthify is thinking...</p>`;

  try {
    const smartPrompt = `
      You're a friendly and smart health assistant. 
      Always provide short, useful, motivating health responses.
      Tone: warm, confident, stylish. Avoid long explanations.

      User: ${prompt}
    `;

    const result = await model.generateContent(smartPrompt);
    const response = await result.response;
    const text = response.text();

    typeEffect(responseBox, text);
  } catch (err) {
    console.error("Gemini Error:", err);
    let msg = "Something went wrong. Please try again.";
    if (err.message.includes('API_KEY_SERVICE_BLOCKED')) {
      msg = "🚫 API key blocked. Create a new one in Google AI Studio.";
    } else if (err.message.includes('403')) {
      msg = "🔒 Access denied. Check API and permissions.";
    } else if (err.message.includes('401')) {
      msg = "❌ Invalid API key.";
    }
    responseBox.innerHTML = `<p class="error">${msg}</p>`;
  } finally {
    button.disabled = false;
  }
};

// Allow Ctrl + Enter to submit
document.getElementById("ai-input").addEventListener("keydown", function (event) {
  if (event.key === "Enter" && event.ctrlKey) {
    askGemini();
  }
});

    //     // All your other functions with window prefix
    //     window.toggleTab = function(tab) {
    //       document.getElementById('login-form').classList.toggle('hidden', tab !== 'login');
    //       document.getElementById('signup-form').classList.toggle('hidden', tab !== 'signup');
    //       document.getElementById('login-tab').classList.toggle('active', tab === 'login');
    //       document.getElementById('signup-tab').classList.toggle('active', tab === 'signup');
    //       window.clearMessages();
    //   };

    //   window.login = async function(email, password) {
    //       try {
    //           window.clearMessages();
              
    //           const snapshot = await db.collection("users").where("email", "==", email).get();
    //           if (snapshot.empty) {
    //               window.onmessage('login-status', 'User not found.', 'error');
    //               return;
    //           }
              
    //           let matchedUser = null;
    //           snapshot.forEach(doc => {
    //               const data = doc.data();
    //               if (data.password === password) {
    //                   matchedUser = { id: doc.id, ...data };
    //               }
    //           });
              
    //           if (!matchedUser) {
    //               window.onmessage('login-status', 'Incorrect password.', 'error');
    //               return;
    //           }
              
    //           currentUser = matchedUser;
    //           window.loadTodayStatsIntoInputs();
    //           window.showDashboard();
    //       } catch (error) {
    //           console.error(error);
    //           window.onmessage('login-status', 'Login failed.', 'error');
    //       }
    //   };

    //   window.loadTodayStatsIntoInputs = async function() {
    //       if (!currentUser) return;
          
    //       const today = new Date().toISOString().split("T")[0];
    //       try {
    //           const doc = await db.collection("users").doc(currentUser.id)
    //               .collection("stats")
    //               .doc(today)
    //               .get();
              
    //           if (doc.exists) {
    //               const { water, steps, sleep } = doc.data();
    //               document.getElementById('water-input').value = water || '';
    //               document.getElementById('steps-input').value = steps || '';
    //               document.getElementById('sleep-input').value = sleep || '';
    //           } else {
    //               document.getElementById('water-input').value = '';
    //               document.getElementById('steps-input').value = '';
    //               document.getElementById('sleep-input').value = '';
    //           }
    //       } catch (err) {
    //           console.error("Error loading today's stats: ", err);
    //       }
    //   };

    //   window.signup = async function(name, email, password) {
    //       try {
    //           const existing = await db.collection("users").where("email", "==", email).get();
    //           if (!existing.empty) {
    //               window.showMessage('signup-status', 'Email already registered.', 'error');
    //               return;
    //           }
    //           await db.collection("users").add({
    //               Name: name,
    //               email,
    //               password,
    //               CreatedAt: firebase.firestore.FieldValue.serverTimestamp()
    //           });
    //           window.showMessage('signup-status', 'Signup successful! Please login.', 'success');
    //           setTimeout(() => window.toggleTab('login'), 1500);
    //       } catch (err) {
    //           console.error(err);
    //           window.showMessage('signup-status', 'Signup failed.', 'error');
    //       }
    //   };

    //   window.showDashboard = function() {
    //       document.querySelector('form#login-form').classList.add('hidden');
    //       document.querySelector('form#signup-form').classList.add('hidden');
    //       document.getElementById('dashboard-section').classList.remove('hidden');
    //       document.querySelector('.tab-container').classList.add('hidden');
          
    //       document.getElementById('display-name').textContent = currentUser.Name;
    //       document.getElementById('display-email').textContent = currentUser.email;
    //       document.getElementById('display-created-at').textContent =
    //           currentUser.CreatedAt?.toDate?.().toLocaleString() || 'Just Now';
    //       window.loadStats();
    //   };

    //   window.logout = function() {
    //       currentUser = null;
          
    //       document.querySelector('.health-card').innerHTML = '';
    //       document.querySelector('#history-table tbody').innerHTML = '';
    //       if (chartInstance) {
    //           chartInstance.destroy();
    //           chartInstance = null;
    //       }
          
    //       document.getElementById('dashboard-section').classList.add('hidden');
    //       document.querySelector('.tab-container').classList.remove('hidden');
    //       document.getElementById('login-form').reset();
    //       document.getElementById('signup-form').reset();
    //       window.toggleTab('login');
    //   };

    //   window.saveStats = async function() {
    //       const water = document.getElementById('water-input').value;
    //       const steps = document.getElementById('steps-input').value;
    //       const sleep = document.getElementById('sleep-input').value;
          
    //       if (!currentUser) return;
          
    //       const today = new Date().toISOString().split("T")[0];
    //       try {
    //           await db.collection("users").doc(currentUser.id)
    //               .collection("stats")
    //               .doc(today)
    //               .set({ water, steps, sleep, date: today });
              
    //           window.showMessage('login-status', 'Stats updated successfully!', 'success');
    //           window.loadStats();
    //       } catch (err) {
    //           console.error(err);
    //           window.showMessage('login-status', 'Failed to save stats.', 'error');
    //       }
    //   };

    //   window.onmessage = function(id, text, type = 'info') {
    //       const el = document.getElementById(id);
    //       el.textContent = text;
    //       el.className = `status-message status-${type}`;
    //       el.style.display = 'block';
    //       setTimeout(() => el.style.display = 'none', 4000);
    //   };

    //   window.clearMessages = function() {
    //       document.querySelectorAll('.status-message').forEach(msg => msg.style.display = 'none');
    //   };

    //   let chartInstance = null;

    //   window.loadStats = async function () {
    //     const today = new Date().toISOString().split("T")[0];
    //     const statsRef = db.collection("users").doc(currentUser.id).collection("stats");
    
    //     try {
    //         const weekAgo = new Date();
    //         weekAgo.setDate(weekAgo.getDate() - 6);
    //         const weekAgoStr = weekAgo.toISOString().split("T")[0];
    
    //         const snapshot = await statsRef
    //             .where("date", ">=", weekAgoStr)
    //             .orderBy("date")
    //             .get();
    
    //         const statsList = [];
    //         snapshot.forEach(doc => statsList.push(doc.data()));
    
    //         // Show today's data in .health-card
    //         const todayData = statsList.find(stat => stat.date === today);
    //         if (todayData) {
    //             document.querySelector('.health-card').innerHTML = `
    //                 <h4>Today's Stats</h4>
    //                 <p>Water Intake: <strong>${todayData.water}</strong></p>
    //                 <p>Steps: <strong>${todayData.steps}</strong></p>
    //                 <p>Sleep: <strong>${todayData.sleep}</strong></p>
    //             `;
    //             document.getElementById('water-input').value = todayData.water;
    //             document.getElementById('steps-input').value = todayData.steps;
    //             document.getElementById('sleep-input').value = todayData.sleep;
    //         } else {
    //             // No stats yet for today — clear inputs
    //             document.getElementById('water-input').value = "";
    //             document.getElementById('steps-input').value = "";
    //             document.getElementById('sleep-input').value = "";
    //             document.querySelector('.health-card').innerHTML = "<p>No stats saved for today yet.</p>";
    //         }
    
    //         // Always show last 7 days data
    //         window.renderHistoryTable(statsList);
    //         window.renderCharts(statsList);
    //     } catch (err) {
    //         console.error("Error loading stats:", err);
    //     }
    // };
    

    //   window.renderHistoryTable = function(data) {
    //       const tbody = document.querySelector('#history-table tbody');
    //       tbody.innerHTML = "";
    //       data.forEach(item => {
    //           const tr = document.createElement('tr');
    //           tr.innerHTML = `
    //               <td>${item.date}</td>
    //               <td>${item.water || '-'}</td>
    //               <td>${item.steps || '-'}</td>
    //               <td>${item.sleep || '-'}</td>
    //           `;
    //           tbody.appendChild(tr);
    //       });
    //   };

    //   window.renderCharts = function(data) {
    //       const labels = data.map(d => d.date);
    //       const water = data.map(d => parseFloat(d.water) || 0);
    //       const steps = data.map(d => parseInt(d.steps) || 0);
    //       const sleep = data.map(d => parseFloat(d.sleep) || 0);
          
    //       const ctx = document.getElementById("chart-stats").getContext("2d");
    //       if (chartInstance) chartInstance.destroy();
          
    //       chartInstance = new Chart(ctx, {
    //           type: 'line',
    //           data: {
    //               labels,
    //               datasets: [
    //                   {
    //                       label: '💧 Water (L)',
    //                       data: water,
    //                       borderColor: '#4fc3f7',
    //                       fill: false
    //                   },
    //                   {
    //                       label: '🚶 Steps',
    //                       data: steps,
    //                       borderColor: '#81c784',
    //                       fill: false
    //                   },
    //                   {
    //                       label: '🛏️ Sleep (hrs)',
    //                       data: sleep,
    //                       borderColor: '#ba68c8',
    //                       fill: false
    //                   }
    //               ]
    //           },
    //           options: {
    //               responsive: true,
    //               plugins: {
    //                   legend: { position: 'bottom' }
    //               },
    //               scales: {
    //                   y: { beginAtZero: true }
    //               }
    //           }
    //       });
    //   };



    ///////////////////upadted app code



    let currentUser = null;
let chartInstance = null;

window.toggleTab = function (tab) {
  document.getElementById('login-form').classList.toggle('hidden', tab !== 'login');
  document.getElementById('signup-form').classList.toggle('hidden', tab !== 'signup');
  document.getElementById('login-tab').classList.toggle('active', tab === 'login');
  document.getElementById('signup-tab').classList.toggle('active', tab === 'signup');
  window.clearMessages();
};

// document.getElementById("login-button").addEventListener("click", () => {
//   const email = document.getElementById("login-email").value.trim();
//   const password = document.getElementById("login-password").value.trim();

//   if (!email || !password) {
//     window.onmessage('login-status', 'Please enter email and password.', 'error');
//     return;
//   }

//   window.login(email, password);
// });


window.login = async function() {
  const email = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value.trim();

  if (!email || !password) {
    window.onmessage('login-status', 'Please enter email and password.', 'error');
    return;
  }

        try {
            window.clearMessages();
            
            const snapshot = await db.collection("users").where("email", "==", email).get();
            if (snapshot.empty) {
                window.onmessage('login-status', 'User not found.', 'error');
                return;
            }
            
            let matchedUser = null;
            snapshot.forEach(doc => {
                const data = doc.data();
                if (data.password === password) {
                    matchedUser = { id: doc.id, ...data };
                }
            });
            
            if (!matchedUser) {
                window.onmessage('login-status', 'Incorrect password.', 'error');
                return;
            }
            
            currentUser = matchedUser;
            window.showDashboard();     
            document.getElementById("ai-input").value = "";
document.getElementById("ai-response-box").innerHTML = "";
          // Show main UI
            await window.loadStatsAfterLogin();   // Load today's stats or clear inputs
        } catch (error) {
            console.error(error);
            window.onmessage('login-status', 'Login failed.', 'error');
        }
    };


    // document.getElementById("signup-form").addEventListener("submit", function (e) {
    //   e.preventDefault(); // prevent form from reloading the page
    
    //   const name = document.getElementById("signup-name").value.trim();
    //   const email = document.getElementById("signup-email").value.trim();
    //   const password = document.getElementById("signup-password").value.trim();
    
    //   if (!name || !email || !password) {
    //     window.onmessage('signup-status', 'Please fill all fields.', 'error');
    //     return;
    //   }
    
    //   window.signup(name, email, password);
    // });
    
window.signup = async function () {
    
  const name = document.getElementById("signup-name").value.trim();
  const email = document.getElementById("signup-email").value.trim();
  const password = document.getElementById("signup-password").value.trim();

  if (!name || !email || !password) {
    window.onmessage('signup-status', 'Please fill all fields.', 'error');
    return;
  }

  try {
    const existing = await db.collection("users").where("email", "==", email).get();
    if (!existing.empty) {
      window.onmessage('signup-status', 'Email already registered.', 'error');
      return;
    }
    await db.collection("users").add({
      Name: name,
      email,
      password,
      CreatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    window.onmessage('signup-status', 'Signup successful! Please login.', 'success');
    setTimeout(() => window.toggleTab('login'), 1500);
  } catch (err) {
    console.error(err);
    window.onmessage('signup-status', 'Signup failed.', 'error');
  }
};

window.showDashboard = function () {
  document.querySelector('form#login-form').classList.add('hidden');
  document.querySelector('form#signup-form').classList.add('hidden');
  document.getElementById('dashboard-section').classList.remove('hidden');
  document.querySelector('.tab-container').classList.add('hidden');

  document.getElementById('display-name').textContent = currentUser.Name;
  document.getElementById('display-email').textContent = currentUser.email;
  document.getElementById('display-created-at').textContent =
    currentUser.CreatedAt?.toDate?.().toLocaleString() || 'Just Now';

  window.loadStats();
};

window.logout = function () {
  currentUser = null;
  document.querySelector('.health-card').innerHTML = '';
  document.querySelector('#history-table tbody').innerHTML = '';

  if (chartInstance) {
    chartInstance.destroy();
    chartInstance = null;
  }

  document.getElementById('dashboard-section').classList.add('hidden');
  document.querySelector('.tab-container').classList.remove('hidden');
  document.getElementById('login-form').reset();
  document.getElementById('signup-form').reset();
  window.toggleTab('login');
};

window.clearMessages = function () {
  document.querySelectorAll('.status-message').forEach(msg => msg.style.display = 'none');
};

window.onmessage = function (id, text, type = 'info') {
  const el = document.getElementById(id);
  el.textContent = text;
  el.className = `status-message status-${type}`;
  el.style.display = 'block';
  setTimeout(() => el.style.display = 'none', 4000);
};
window.loadStatsAfterLogin = async function () {
  if (!currentUser || !currentUser.id) return;

  const today = new Date().toLocaleDateString('en-CA'); // e.g., "2025-07-09"
  const statsRef = db.collection("users").doc(currentUser.id).collection("stats");

  try {
    const todayDoc = await statsRef.doc(today).get();

    if (todayDoc.exists) {
      console.log("✅ Found today's stats.");
      const { water, steps, sleep } = todayDoc.data();
      document.getElementById("water-input").value = water || '';
      document.getElementById("steps-input").value = steps || '';
      document.getElementById("sleep-input").value = sleep || '';
    } else {
      console.log("📭 No stats for today. Empty inputs.");
      document.getElementById("water-input").value = '';
      document.getElementById("steps-input").value = '';
      document.getElementById("sleep-input").value = '';
    }

    // Always load history/chart
    window.loadStats();
  } catch (error) {
    console.error("❌ Error loading today's stats:", error);
  }
};


window.loadTodayStatsIntoInputs = async function () {
  if (!currentUser) return;
  // const today = new Date().toISOString().split("T")[0];
  const today = new Date().toLocaleDateString('en-CA'); // ✅ Gives system/local date in YYYY-MM-DD format


  try {
    const doc = await db.collection("users")
      .doc(currentUser.id)
      .collection("stats")
      .doc(today)
      .get();

    if (doc.exists) {
      const { water, steps, sleep } = doc.data();
      document.getElementById('water-input').value = water || '';
      document.getElementById('steps-input').value = steps || '';
      document.getElementById('sleep-input').value = sleep || '';
    } else {
      document.getElementById('water-input').value = '';
      document.getElementById('steps-input').value = '';
      document.getElementById('sleep-input').value = '';
    }
  } catch (err) {
    console.error("Error loading today's stats: ", err);
  }
};

window.saveStats = async function () {
  const water = parseFloat(document.getElementById("water-input").value) || 0;
  const steps = parseInt(document.getElementById("steps-input").value) || 0;
  const sleep = parseFloat(document.getElementById("sleep-input").value) || 0;

  const today = new Date().toLocaleDateString('en-CA'); // 📅 Get local date in YYYY-MM-DD
  const statsRef = db.collection("users").doc(currentUser.id).collection("stats").doc(today);

  try {
    const doc = await statsRef.get();

    if (doc.exists) {
      // 🔁 Entry for today exists → Update
      await statsRef.set({
        water,
        steps,
        sleep,
        date: today,
        updatedAt: new Date()
      }, { merge: true });

      alert("🔄 Today's stats updated successfully!");
    } else {
      // 🆕 New day → Add fresh entry
      await statsRef.set({
        water,
        steps,
        sleep,
        date: today,
        createdAt: new Date()
      });

      alert("✅ New stats saved for today!");
    }

    window.loadStats(); // Refresh table/chart
  } catch (error) {
    console.error("❌ Error saving/updating stats:", error);
    alert("❌ Failed to save or update stats.");
  }
};



// window.saveStats = async function () {
//   const water = document.getElementById('water-input').value;
//   const steps = document.getElementById('steps-input').value;
//   const sleep = document.getElementById('sleep-input').value;

//   if (!currentUser) return;

//   const today = new Date().toISOString().split("T")[0];

//   try {
//     await db.collection("users")
//       .doc(currentUser.id)
//       .collection("stats")
//       .doc(today)
//       .set({ water, steps, sleep, date: today });

//     window.onmessage('login-status', 'Stats updated successfully!', 'success');
//     window.loadStats();
//   } catch (err) {
//     console.error(err);
//     window.showMessage('login-status', 'Failed to save stats.', 'error');
//   }
// };

window.loadStats = async function () {
  // const today = new Date().toISOString().split("T")[0];
  const today = new Date().toLocaleDateString('en-CA'); // ✅ Gives system/local date in YYYY-MM-DD format

  const statsRef = db.collection("users").doc(currentUser.id).collection("stats");

  try {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 6);
    const weekAgoStr = weekAgo.toISOString().split("T")[0];

    const snapshot = await statsRef
      .where("date", ">=", weekAgoStr)
      .orderBy("date")
      .get();

    const statsList = [];
    snapshot.forEach(doc => statsList.push(doc.data()));

    const todayData = statsList.find(stat => stat.date === today);
    if (todayData) {
      document.querySelector('.health-card').innerHTML = `
        <h4>Today's Stats</h4>
        <p>Water Intake: <strong>${todayData.water}</strong></p>
        <p>Steps: <strong>${todayData.steps}</strong></p>
        <p>Sleep: <strong>${todayData.sleep}</strong></p>
      `;
      document.getElementById('water-input').value = todayData.water;
      document.getElementById('steps-input').value = todayData.steps;
      document.getElementById('sleep-input').value = todayData.sleep;
    } else {
      document.querySelector('.health-card').innerHTML = "<p>No stats saved for today yet.</p>";
      document.getElementById('water-input').value = "";
      document.getElementById('steps-input').value = "";
      document.getElementById('sleep-input').value = "";
    }

    window.renderHistoryTable(statsList);
    window.renderCharts(statsList);
  } catch (err) {
    console.error("Error loading stats:", err);
  }
};

window.renderHistoryTable = function (data) {
  const tbody = document.querySelector('#history-table tbody');
  tbody.innerHTML = "";
  data.forEach(item => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${item.date}</td>
      <td>${item.water || '-'}</td>
      <td>${item.steps || '-'}</td>
      <td>${item.sleep || '-'}</td>
    `;
    tbody.appendChild(tr);
  });
};

window.renderCharts = function (data) {
  const labels = data.map(d => d.date);
  const water = data.map(d => parseFloat(d.water) || 0);
  const steps = data.map(d => parseInt(d.steps) || 0);
  const sleep = data.map(d => parseFloat(d.sleep) || 0);

  const ctx = document.getElementById("chart-stats").getContext("2d");
  if (chartInstance) chartInstance.destroy();

  chartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: '💧 Water (L)',
          data: water,
          borderColor: '#4fc3f7',
          fill: false
        },
        {
          label: '🚶 Steps',
          data: steps,
          borderColor: '#81c784',
          fill: false
        },
        {
          label: '🛏️ Sleep (hrs)',
          data: sleep,
          borderColor: '#ba68c8',
          fill: false
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'bottom' }
      },
      scales: {
        y: { beginAtZero: true }
      }
    }
  });
};