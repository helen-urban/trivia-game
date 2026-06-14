import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// App State
let appState = {
    currentScreen: 'home', // home, quiz, results, leaderboard
    currentQuiz: null,
    userAnswers: [],
    userName: '',
    userScore: 0,
    quizSessionId: null,
    leaderboardData: []
}

const app = document.getElementById('app')

// Render functions
function renderHome() {
    app.innerHTML = `
        <div class="min-h-screen flex items-center justify-center px-4">
            <div class="fade-in max-w-md w-full">
                <div class="bg-white rounded-2xl shadow-2xl p-8 text-center">
                    <div class="text-6xl mb-4">🌍</div>
                    <h1 class="text-4xl font-bold text-gray-800 mb-2">World News</h1>
                    <h2 class="text-2xl font-bold text-purple-600 mb-4">Trivia Game</h2>
                    <p class="text-gray-600 mb-8">Test your knowledge of the latest global news! Answer 5 questions and challenge your friends.</p>
                    
                    <div class="mb-6">
                        <input 
                            type="text" 
                            id="userName"
                            placeholder="Enter your name" 
                            class="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 mb-4"
                        />
                        <button 
                            onclick="startQuiz()"
                            class="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-3 rounded-lg hover:shadow-lg transition"
                        >
                            Start Quiz 🚀
                        </button>
                    </div>
                    
                    <button 
                        onclick="showLeaderboard()"
                        class="w-full bg-gray-200 text-gray-800 font-bold py-2 rounded-lg hover:bg-gray-300 transition"
                    >
                        View Leaderboard 📊
                    </button>
                </div>
            </div>
        </div>
    `
}

function renderQuiz() {
    if (!appState.currentQuiz || appState.currentQuiz.length === 0) {
        app.innerHTML = `
            <div class="min-h-screen flex items-center justify-center">
                <div class="text-center">
                    <div class="text-4xl mb-4">⏳</div>
                    <p class="text-xl text-gray-600">Loading questions...</p>
                </div>
            </div>
        `
        return
    }

    const currentQuestion = appState.currentQuiz[appState.userAnswers.length]
    const progress = appState.userAnswers.length + 1

    app.innerHTML = `
        <div class="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 px-4 py-8">
            <div class="scale-in max-w-2xl mx-auto">
                <!-- Progress Bar -->
                <div class="mb-8">
                    <div class="flex justify-between items-center mb-2">
                        <h1 class="text-2xl font-bold text-gray-800">Question ${progress}/5</h1>
                        <span class="text-sm text-gray-600">🌍 World News Trivia</span>
                    </div>
                    <div class="w-full bg-gray-300 rounded-full h-2">
                        <div class="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full" style="width: ${(progress / 5) * 100}%"></div>
                    </div>
                </div>

                <!-- Question Card -->
                <div class="bg-white rounded-2xl shadow-xl p-8 mb-8">
                    <h2 class="text-2xl font-bold text-gray-800 mb-8">${currentQuestion.question}</h2>
                    
                    <div class="space-y-4" id="optionsContainer">
                        ${currentQuestion.options.map((option, index) => `
                            <button 
                                onclick="selectAnswer(${index})"
                                class="w-full text-left p-4 rounded-lg border-2 border-gray-300 hover:border-purple-500 hover:bg-purple-50 transition"
                            >
                                <span class="font-semibold text-gray-700">${String.fromCharCode(65 + index)}.</span> ${option}
                            </button>
                        `).join('')}
                    </div>
                </div>

                <div class="flex gap-4">
                    <button 
                        onclick="goHome()"
                        class="flex-1 bg-gray-300 text-gray-800 font-bold py-3 rounded-lg hover:bg-gray-400 transition"
                    >
                        ← Exit
                    </button>
                </div>
            </div>
        </div>
    `
}

function renderResults(score) {
    const percentage = Math.round((score / 5) * 100)
    const message = percentage === 100 ? '🏆 Perfect!' : percentage >= 80 ? '👏 Great!' : percentage >= 60 ? '😊 Good!' : '📚 Keep Learning!'
    const shareUrl = `${window.location.origin}?score=${score}&name=${encodeURIComponent(appState.userName)}&session=${appState.quizSessionId}`

    app.innerHTML = `
        <div class="min-h-screen flex items-center justify-center px-4 py-8">
            <div class="fade-in max-w-md w-full">
                <div class="bg-white rounded-2xl shadow-2xl p-8 text-center">
                    <div class="text-6xl mb-4">${message.split(' ')[0]}</div>
                    <h1 class="text-3xl font-bold text-gray-800 mb-2">Quiz Complete!</h1>
                    
                    <div class="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl p-6 mb-6 mt-6">
                        <p class="text-5xl font-bold">${score}/5</p>
                        <p class="text-lg mt-2">${percentage}% Correct</p>
                    </div>

                    <div class="mb-6 max-h-64 overflow-y-auto">
                        <h3 class="font-bold text-gray-700 mb-2">Your Answers:</h3>
                        ${appState.currentQuiz.map((q, i) => `
                            <div class="text-left text-sm text-gray-600 mb-2 p-2 bg-gray-50 rounded">
                                <p class="font-semibold">Q${i + 1}: ${appState.userAnswers[i].correct ? '✅' : '❌'}</p>
                                <p class="text-xs">Your answer: ${q.options[appState.userAnswers[i].selected]}</p>
                                <p class="text-xs text-green-600">Correct: ${q.options[q.correct]}</p>
                            </div>
                        `).join('')}
                    </div>

                    <button 
                        onclick="copyShareLink('${shareUrl}')"
                        class="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold py-3 rounded-lg hover:shadow-lg transition mb-4"
                    >
                        📤 Share Your Score
                    </button>

                    <button 
                        onclick="goHome()"
                        class="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-3 rounded-lg hover:shadow-lg transition mb-2"
                    >
                        Play Again 🔄
                    </button>
                    
                    <button 
                        onclick="showLeaderboard()"
                        class="w-full bg-gray-200 text-gray-800 font-bold py-2 rounded-lg hover:bg-gray-300 transition"
                    >
                        View Leaderboard 📊
                    </button>
                </div>
            </div>
        </div>
    `
}

function renderLeaderboard() {
    app.innerHTML = `
        <div class="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 px-4 py-8">
            <div class="fade-in max-w-2xl mx-auto">
                <div class="bg-white rounded-2xl shadow-2xl p-8">
                    <h1 class="text-3xl font-bold text-gray-800 mb-2">🏆 Leaderboard</h1>
                    <p class="text-gray-600 mb-6">Last 50 Players</p>
                    
                    <div id="leaderboardList" class="space-y-2 mb-8">
                        <p class="text-gray-600 text-center py-4">Loading leaderboard...</p>
                    </div>
                    
                    <button 
                        onclick="goHome()"
                        class="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-3 rounded-lg hover:shadow-lg transition"
                    >
                        ← Back to Home
                    </button>
                </div>
            </div>
        </div>
    `
    loadLeaderboard()
}

// Logic functions
async function startQuiz() {
    appState.userName = document.getElementById('userName').value.trim()
    if (!appState.userName) {
        alert('Please enter your name!')
        return
    }

    appState.currentScreen = 'quiz'
    appState.userAnswers = []
    appState.userScore = 0
    
    renderQuiz()
    await loadOrCreateQuiz()
}

async function loadOrCreateQuiz() {
    try {
        // Get current session ID (based on 30-min intervals)
        const sessionId = getSessionId()
        appState.quizSessionId = sessionId

        // Try to get existing quiz for this session
        const { data: existingSession } = await supabase
            .from('quiz_sessions')
            .select('questions')
            .eq('id', sessionId)
            .single()

        if (existingSession) {
            appState.currentQuiz = existingSession.questions
        } else {
            // Generate new questions using OpenAI
            const questions = await generateQuestions()
            appState.currentQuiz = questions

            // Save to database
            await supabase
                .from('quiz_sessions')
                .insert({ id: sessionId, questions })
        }

        renderQuiz()
    } catch (error) {
        console.error('Error loading quiz:', error)
        alert('Failed to load quiz. Please check your API keys in .env.local')
    }
}

function getSessionId() {
    const now = new Date()
    const minutes = Math.floor(now.getMinutes() / 30) * 30
    return now.toISOString().split('T')[0] + '_' + String(now.getHours()).padStart(2, '0') + '_' + String(minutes).padStart(2, '0')
}

async function generateQuestions() {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: 'gpt-4',
            messages: [
                {
                    role: 'system',
                    content: 'You are a trivia question generator. Generate exactly 5 multiple choice questions about recent world news events. Return as JSON array with format: [{"question": "...", "options": ["...", "...", "...", "..."], "correct": 0}]. The "correct" field is the index of the correct answer (0-3). Make questions engaging and factual about recent news.'
                },
                {
                    role: 'user',
                    content: 'Generate 5 world news trivia questions for today'
                }
            ],
            temperature: 0.7,
            max_tokens: 1500
        })
    })

    const data = await response.json()
    
    if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to generate questions')
    }

    try {
        const content = data.choices[0].message.content
        const jsonMatch = content.match(/\[\s*\{[\s\S]*\}\s*\]/)
        return JSON.parse(jsonMatch[0])
    } catch (error) {
        console.error('Error parsing questions:', error)
        // Fallback questions
        return generateFallbackQuestions()
    }
}

function generateFallbackQuestions() {
    return [
        {
            question: "Which country recently hosted a major climate summit?",
            options: ["Brazil", "Canada", "Norway", "Germany"],
            correct: 0
        },
        {
            question: "What is the current status of the war in Ukraine?",
            options: ["Resolved", "Ongoing", "On pause", "Escalating"],
            correct: 1
        },
        {
            question: "Which tech company recently made major AI announcements?",
            options: ["OpenAI", "Google", "Meta", "All of the above"],
            correct: 3
        },
        {
            question: "What global economic indicator has been closely watched?",
            options: ["Inflation", "GDP growth", "Stock markets", "All of the above"],
            correct: 3
        },
        {
            question: "Which country recently held major elections?",
            options: ["France", "India", "Japan", "South Korea"],
            correct: 2
        }
    ]
}

function selectAnswer(answerIndex) {
    const currentQuestion = appState.currentQuiz[appState.userAnswers.length]
    const isCorrect = answerIndex === currentQuestion.correct
    
    appState.userAnswers.push({ selected: answerIndex, correct: isCorrect })
    if (isCorrect) appState.userScore++

    if (appState.userAnswers.length < 5) {
        setTimeout(() => renderQuiz(), 500)
    } else {
        submitScore()
    }
}

async function submitScore() {
    try {
        await supabase.from('scores').insert({
            user_name: appState.userName,
            score: appState.userScore,
            quiz_session_id: appState.quizSessionId,
            answers: appState.userAnswers
        })
        
        appState.currentScreen = 'results'
        renderResults(appState.userScore)
    } catch (error) {
        console.error('Error submitting score:', error)
        alert('Error saving your score')
    }
}

async function loadLeaderboard() {
    try {
        const { data: scores } = await supabase
            .from('scores')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(50)

        appState.leaderboardData = scores || []
        
        const html = scores && scores.length > 0 ? scores.map((entry, index) => `
            <div class="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border-l-4 ${index === 0 ? 'border-yellow-400' : index === 1 ? 'border-gray-400' : index === 2 ? 'border-orange-400' : 'border-gray-300'} mb-2">
                <div class="flex items-center">
                    <span class="text-2xl font-bold w-8">${index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}</span>
                    <div class="ml-4">
                        <p class="font-bold text-gray-800">${entry.user_name}</p>
                        <p class="text-xs text-gray-600">${new Date(entry.created_at).toLocaleString()}</p>
                    </div>
                </div>
                <div class="text-right">
                    <p class="text-2xl font-bold text-purple-600">${entry.score}/5</p>
                    <p class="text-xs text-gray-600">${Math.round((entry.score / 5) * 100)}%</p>
                </div>
            </div>
        `).join('') : '<p class="text-gray-600 text-center py-4">No scores yet. Be the first!</p>'
        
        document.getElementById('leaderboardList').innerHTML = html
    } catch (error) {
        console.error('Error loading leaderboard:', error)
        document.getElementById('leaderboardList').innerHTML = '<p class="text-red-600">Error loading leaderboard</p>'
    }
}

function copyShareLink(url) {
    navigator.clipboard.writeText(url).then(() => {
        alert('✅ Share link copied to clipboard!')
    }).catch(err => {
        prompt('Copy this link:', url)
    })
}

function goHome() {
    appState.currentScreen = 'home'
    appState.userAnswers = []
    appState.userScore = 0
    appState.userName = ''
    renderHome()
}

function showLeaderboard() {
    appState.currentScreen = 'leaderboard'
    renderLeaderboard()
}

// Initialize app
renderHome()

// Check for shared score parameters
const params = new URLSearchParams(window.location.search)
if (params.has('score')) {
    const score = params.get('score')
    const name = params.get('name')
    alert(`${name} scored ${score}/5! Can you beat that? 🏁`)
}
