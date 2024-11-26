const loginBtn = document.getElementById('loginBtn');
const signupBtn = document.getElementById('signupBtn');
const loginModal = document.getElementById('loginModal');
const signupModal = document.getElementById('signupModal');
const closeBtns = document.querySelectorAll('.close');
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const workoutForm = document.getElementById('workoutForm');
const workoutList = document.getElementById('workoutList');

let currentUser = null;
let currentRate = 0;

function openModal(modal) {
    modal.style.display = 'block';
}

function closeModal(modal) {
    modal.style.display = 'none';
}

loginBtn.addEventListener('click', () => openModal(loginModal));
signupBtn.addEventListener('click', () => openModal(signupModal));

closeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        closeModal(loginModal);
        closeModal(signupModal);
    });
});

window.addEventListener('click', (e) => {
    if (e.target === loginModal) closeModal(loginModal);
    if (e.target === signupModal) closeModal(signupModal);
});

function checkRegisteredUsers() {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    console.log('Registered Users:', users);
    return users;
}

loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = e.target.elements[0].value;
    const password = e.target.elements[1].value;
    
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
        closeModal(loginModal);
        updateUI();
        showNotification('Login successful!', 'success');
    } else {
        showNotification('Invalid credentials!', 'error');
    }
});

signupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = e.target.elements[0].value;
    const email = e.target.elements[1].value;
    const password = e.target.elements[2].value;
    const confirmPassword = e.target.elements[3].value;
    
    if (password !== confirmPassword) {
        showNotification('Passwords do not match!', 'error');
        return;
    }
    
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    if (users.some(u => u.email === email)) {
        showNotification('Email already exists!', 'error');
        return;
    }
    
    const newUser = { name, email, password };
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    closeModal(signupModal);
    showNotification('Account created successfully!', 'success');
    console.log('New user registered:', newUser);
    checkRegisteredUsers();
});

workoutForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!currentUser) {
        showNotification('Please login to track workouts!', 'error');
        return;
    }
    
    const workout = {
        date: e.target.workoutDate.value,
        exercise: e.target.exerciseType.value,
        weight: e.target.weight.value,
        sets: e.target.sets.value,
        reps: e.target.reps.value,
        timestamp: new Date().getTime()
    };
    
    const workouts = JSON.parse(localStorage.getItem(`workouts_${currentUser.email}`) || '[]');
    workouts.push(workout);
    localStorage.setItem(`workouts_${currentUser.email}`, JSON.stringify(workouts));
    
    updateWorkoutList();
    showNotification('Workout added successfully!', 'success');
    e.target.reset();
});

function updateUI() {
    if (currentUser) {
        loginBtn.style.display = 'none';
        signupBtn.style.display = 'none';
        updateWorkoutList();
    } else {
        loginBtn.style.display = 'block';
        signupBtn.style.display = 'block';
        workoutList.innerHTML = '<p>Please login to view your workout history.</p>';
    }
}

function updateWorkoutList() {
    if (!currentUser) return;
    
    const workouts = JSON.parse(localStorage.getItem(`workouts_${currentUser.email}`) || '[]');
    workouts.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    workoutList.innerHTML = workouts.map(workout => `
        <div class="workout-entry">
            <h4>${workout.exercise}</h4>
            <p>Date: ${workout.date}</p>
            <p>Weight: ${workout.weight}kg</p>
            <p>Sets: ${workout.sets}</p>
            <p>Reps: ${workout.reps}</p>
        </div>
    `).join('') || '<p>No workouts recorded yet.</p>';
}

function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => notification.remove(), 500);
    }, 3000);
}

async function fetchExchangeRate() {
    try {
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
        const data = await response.json();
        currentRate = data.rates.INR;
        document.getElementById('exchange-rate').textContent = `1 USD = ₹${currentRate.toFixed(2)} INR`;
    } catch (error) {
        console.error('Error fetching exchange rate:', error);
        document.getElementById('exchange-rate').textContent = 'Error loading rate';
    }
}

function convertCurrency() {
    const usdAmount = parseFloat(document.getElementById('usd').value);
    if (isNaN(usdAmount)) {
        document.getElementById('converted-amount').textContent = 'Please enter a valid amount';
        return;
    }
    
    const inrAmount = usdAmount * currentRate;
    document.getElementById('converted-amount').textContent = `₹${inrAmount.toFixed(2)}`;
}

document.addEventListener('DOMContentLoaded', () => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        updateUI();
    }
    fetchExchangeRate();
    document.getElementById('usd').addEventListener('input', convertCurrency);
    setInterval(fetchExchangeRate, 300000);
});

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});
