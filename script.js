// script.js

//Theme
document.addEventListener("DOMContentLoaded", () => {
    loadPreferences();
    setupEventListeners();
    loadBookmarks();
    loadNotes();
});

function loadPreferences() {
    const savedTheme = localStorage.getItem("theme") || "light";
    const savedLanguage = localStorage.getItem("language") || "english";
    
    document.getElementById("theme").value = savedTheme;    
    document.getElementById("language").value = savedLanguage;

    applyTheme(savedTheme);
    applyLanguage(savedLanguage);
}
function setupEventListeners() {
    document.getElementById("theme").addEventListener("change", changeTheme);
    document.getElementById("language").addEventListener("change", changeLanguage);
}

function changeTheme() {
    const selectedTheme = document.getElementById("theme").value;
    applyTheme(selectedTheme);
    localStorage.setItem("theme", selectedTheme);
}

function applyTheme(theme) {
    const themeLink = document.getElementById("theme-style");
    if (theme === "dark") {
        themeLink.setAttribute("href", "styles-dark.css");
    } else {
        themeLink.setAttribute("href", "styles-light.css");
    }
}

function changeLanguage() {
    const selectedLanguage = document.getElementById("language").value;
    applyLanguage(selectedLanguage);
    localStorage.setItem("language", selectedLanguage);
}

function applyLanguage(language) {
    const langElements = document.querySelectorAll("[data-lang]");
    langElements.forEach(element => {
        const key = element.getAttribute("data-lang");
        element.textContent = translations[language][key];
    });
}
const translations = {
    english: {
        welcome: "Welcome to the UPSC Quiz Application",
        description: "Enhance your preparation with our comprehensive quiz platform",
        takeQuiz: "Take Quiz",
        reviewAnswers: "Review Answers",
        performanceStatistics: "Performance Statistics",
        settings: "Settings",
        profile: "Profile"
    },
    hindi: {
        welcome: "यूपीएससी क्विज एप्लिकेशन में आपका स्वागत है",
        description: "हमारे व्यापक क्विज़ प्लेटफ़ॉर्म के साथ अपनी तैयारी को बढ़ाएँ",
        takeQuiz: "प्रश्नोत्तरी लें",
        reviewAnswers: "उत्तर की समीक्षा करें",
        performanceStatistics: "प्रदर्शन आँकड़े",
        settings: "सेटिंग्स",
        profile: "प्रोफ़ाइल"
    }
};

function loadBookmarks() {
    const bookmarks = JSON.parse(localStorage.getItem("bookmarks")) || [];
    const bookmarkList = document.getElementById("bookmark-list");
    bookmarkList.innerHTML = '';
    bookmarks.forEach(bookmark => {
        const li = document.createElement("li");
        li.textContent = bookmark;
        bookmarkList.appendChild(li);
    });
}

function addBookmark(question) {
    const bookmarks = JSON.parse(localStorage.getItem("bookmarks")) || [];
    bookmarks.push(question);
    localStorage.setItem("bookmarks", JSON.stringify(bookmarks));
    loadBookmarks();
}

function loadNotes() {
    const notes = JSON.parse(localStorage.getItem("notes")) || [];
    const notesList = document.getElementById("notes-list");
    notesList.innerHTML = '';
    notes.forEach(note => {
        const li = document.createElement("li");
        li.textContent = `${note.question}: ${note.text}`;
        notesList.appendChild(li);
    });
}

function addNoteToQuestion(question, text) {
    const notes = JSON.parse(localStorage.getItem("notes")) || [];
    notes.push({ question, text });
    localStorage.setItem("notes", JSON.stringify(notes));
    loadNotes();
}

document.getElementById("bookmark-button").addEventListener("click", () => {
    const question = document.getElementById("question").textContent;
    addBookmark(question);
});

document.getElementById("add-note-button").addEventListener("click", () => {
    const question = document.getElementById("question").textContent;
    const noteText = document.getElementById("note-text").value;
    addNoteToQuestion(question, noteText);
    document.getElementById("note-text").value = '';
});




let currentQuestionIndex = 0;
let questions = [
    {
        question: "What is the capital of India?",
        options: ["New Delhi", "Mumbai", "Kolkata", "Chennai"],
        answer: "New Delhi",
        explanation: "New Delhi is the capital city of India."
    },
    {
        question: "Who is the current Prime Minister of India?",
        options: ["Narendra Modi", "Rahul Gandhi", "Amit Shah", "Manmohan Singh"],
        answer: "Narendra Modi",
        explanation: "Narendra Modi has been the Prime Minister of India since 2014."
    }
    // Add more questions as needed
];
let userAnswers = [];
let timer;
let timeLeft = 180; // 10 minutes
let pastResults = JSON.parse(localStorage.getItem('pastResults')) || []; // Retrieve past results from localStorage

document.addEventListener('DOMContentLoaded', () => {
    // Display past results on load
    showPerformanceStatistics();
});

function startQuiz() {
    document.getElementById('home-screen').style.display = 'none';
    document.getElementById('quiz-screen').style.display = 'block';
    loadQuestion();
    startTimer();
}

function loadQuestion() {
    let question = questions[currentQuestionIndex];
    document.getElementById('question').innerText = question.question;
    let optionsContainer = document.getElementById('options');
    optionsContainer.innerHTML = '';
    question.options.forEach((option, index) => {
        let label = document.createElement('label');
        let input = document.createElement('input');
        input.type = 'radio';
        input.name = 'option';
        input.value = option;
        label.appendChild(input);
        label.appendChild(document.createTextNode(option));
        optionsContainer.appendChild(label);
    });
    updateProgress();
}
function loadAnswer() {
    let selectedAnswer = userAnswers[currentQuestionIndex];

    // If there's a saved answer for this question, check the corresponding radio button
    if (selectedAnswer !== null && selectedAnswer !== undefined) {
        const optionElement = document.querySelector(`input[name="option"][value="${selectedAnswer}"]`);
        if (optionElement) {
            optionElement.checked = true;
        }
    }
}


function nextQuestion() {
    saveAnswer();
    if (currentQuestionIndex < questions.length - 1) {
        currentQuestionIndex++;
        loadQuestion();
         loadAnswer();
    }
}

function prevQuestion() {
    saveAnswer();
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        loadQuestion();
         loadAnswer();
    }
}

function skipQuestion() {
    nextQuestion();
}

function submitQuiz() {
    clearInterval(timer);
    saveAnswer();
    calculateScore();
    saveResult();
    showReviewScreen();
    showPerformanceStatistics();
}

function startTimer() {
    timer = setInterval(() => {
        if (timeLeft <= 0) {
            clearInterval(timer);
            alert("Time's up!");
            submitQuiz();
        } else {
            timeLeft--;
            let minutes = Math.floor(timeLeft / 60);
            let seconds = timeLeft % 60;
            document.getElementById('timer').innerText = `Time left: ${minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
        }
    }, 1000);
}

function updateProgress() {
    let progress = ((currentQuestionIndex + 1) / questions.length) * 100;
    document.getElementById('progress').style.width = progress + '%';
}

function saveAnswer() {
    let selectedOption = document.querySelector('input[name="option"]:checked');
    if (selectedOption) {
        userAnswers[currentQuestionIndex] = selectedOption.value;
    } else {
        userAnswers[currentQuestionIndex] = null;
    }
}

function calculateScore() {
    let score = 0;
    questions.forEach((question, index) => {
        if (userAnswers[index] === question.answer) {
            score++;
        }
    });
    let percentage = (score / questions.length) * 100;
    document.getElementById('score-summary').innerText = `Total Score: ${score}/${questions.length} (${percentage.toFixed(2)}%)`;
}

function showReviewScreen() {
    document.getElementById('quiz-screen').style.display = 'none';
    document.getElementById('review-screen').style.display = 'block';
    let reviewContainer = document.getElementById('review-container');
    reviewContainer.innerHTML = '';
    questions.forEach((question, index) => {
        let reviewQuestion = document.createElement('div');
        reviewQuestion.className = 'review-question';
        if (userAnswers[index] === question.answer) {
            reviewQuestion.classList.add('correct');
        } else {
            reviewQuestion.classList.add('incorrect');
        }
        reviewQuestion.innerHTML = `
            <p><strong>Question ${index + 1}:</strong> ${question.question}</p>
            <p><strong>Your answer:</strong> ${userAnswers[index] || 'Not Answered'}</p>
            <p><strong>Correct answer:</strong> ${question.answer}</p>
            <p><strong>Explanation:</strong> ${question.explanation}</p>
        `;
        reviewContainer.appendChild(reviewQuestion);
    });
}

function saveResult() {
    let score = 0;
    questions.forEach((question, index) => {
        if (userAnswers[index] === question.answer) {
            score++;
        }
    });
    let percentage = (score / questions.length) * 100;
    let result = {
        date: new Date().toLocaleString(),
        score: score,
        percentage: percentage,
        userAnswers: [...userAnswers],
        questions: [...questions]
    };
    pastResults.push(result);
    localStorage.setItem('pastResults', JSON.stringify(pastResults));
}

function showPerformanceStatistics() {
    let pastResults = JSON.parse(localStorage.getItem('pastResults')) || [];
    let labels = pastResults.map(result => result.date);
    let data = pastResults.map(result => result.percentage);
    let ctx = document.getElementById('performanceChart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Performance Over Time',
                data: data,
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
                fill: false
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
    displayPastResults(pastResults);
}

function displayPastResults(results) {
    let pastResultsContainer = document.getElementById('past-results');
    pastResultsContainer.innerHTML = '';
    results.forEach(result => {
        let listItem = document.createElement('li');
        listItem.innerHTML = `
            <strong>Date:</strong> ${result.date}<br>
            <strong>Score:</strong> ${result.score}/${result.questions.length} (${result.percentage.toFixed(2)}%)
        `;
        pastResultsContainer.appendChild(listItem);
    });
}

function showSection(sectionId) {
    document.querySelectorAll('main').forEach(main => main.style.display = 'none');
    document.getElementById(sectionId).style.display = 'block';
}

// //User-info
function previewPhoto(event) {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = function() {
        const userPhoto = document.getElementById('user-photo');
        userPhoto.src = reader.result;
        userPhoto.style.border="2px solid black";
        // Save the image to local storage or server
        localStorage.setItem('userPhoto', reader.result);
        // Change the button text to "Edit"
        document.getElementById('edit-photo').textContent = 'Edit Photo';
    };
    if (file) {
        reader.readAsDataURL(file);
    }
}

function loadUserPhoto() {
    const savedPhoto = localStorage.getItem('userPhoto');
    if (savedPhoto) {
        document.getElementById('user-photo').src = savedPhoto;
        // Change the button text to "Edit" if a photo is already saved
        document.getElementById('edit-photo').textContent = 'Edit Photo';
    }
}

function triggerPhotoUpload() {
    document.getElementById('photo-upload').click();
}

// Call this function when the profile screen is loaded
loadUserPhoto();

//bio
function saveBio() {
    var bio = document.getElementById('bioText').value;
    if (bio.trim() === '') {
        localStorage.setItem('userBio', '');
        document.getElementById('bioButton').textContent = 'Add Bio';
        return;
    }
    localStorage.setItem('userBio', bio);
    document.getElementById('bioButton').textContent = 'Update Bio';
}

// Check if bio exists in localStorage on page load
window.onload = function() {
    var savedBio = localStorage.getItem('userBio');
    if (savedBio) {
        document.getElementById('bioText').value = savedBio;
        document.getElementById('bioButton').textContent = 'Update Bio';
    }
};
