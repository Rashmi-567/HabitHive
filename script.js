// Global state
let habits = JSON.parse(localStorage.getItem('habits')) || [];
let todos = JSON.parse(localStorage.getItem('todos')) || [];
let calendarData = JSON.parse(localStorage.getItem('calendarData')) || {};
let currentDate = new Date();
let selectedDate = null;
let selectedSticker = null;

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    // Load sample data if no existing data
    if (habits.length === 0) {
        habits = [
            {
                id: 1,
                name: "Morning Exercise",
                category: "fitness",
                streak: 12,
                completedDates: getLastNDaysCompleted(12, 0.8),
                lastCompleted: null
            },
            {
                id: 2,
                name: "Read 30 Minutes",
                category: "learning",
                streak: 8,
                completedDates: getLastNDaysCompleted(8, 0.9),
                lastCompleted: null
            },
            {
                id: 3,
                name: "Drink 8 Glasses Water",
                category: "health",
                streak: 15,
                completedDates: getLastNDaysCompleted(15, 0.7),
                lastCompleted: null
            }
        ];
        saveHabits();
    }

    if (todos.length === 0) {
        todos = [
            {
                id: 1,
                title: "Review Calculus Chapter 5",
                subject: "Mathematics",
                dueDate: "2024-12-25",
                priority: "high",
                completed: false
            },
            {
                id: 2,
                title: "Complete Physics Lab Report",
                subject: "Physics",
                dueDate: "2024-12-20",
                priority: "medium",
                completed: false
            },
            {
                id: 3,
                title: "Study for Chemistry Quiz",
                subject: "Chemistry",
                dueDate: "2024-12-18",
                priority: "high",
                completed: true
            }
        ];
        saveTodos();
    }

    renderStats();
    renderHabits();
    renderCalendar();
    renderTodos();
});

// Helper function to generate sample completed dates
function getLastNDaysCompleted(days, completionRate) {
    const dates = [];
    const today = new Date();
    
    for (let i = 0; i < days; i++) {
        if (Math.random() < completionRate) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            dates.push(date.toISOString().split('T')[0]);
        }
    }
    return dates;
}

// Stats functions
function renderStats() {
    const totalHabits = habits.length;
    const longestStreak = Math.max(...habits.map(h => h.streak), 0);
    const today = new Date().toISOString().split('T')[0];
    const todayCompleted = habits.filter(h => h.completedDates.includes(today)).length;
    const todoCount = todos.filter(t => !t.completed).length;

    document.getElementById('totalHabits').textContent = totalHabits;
    document.getElementById('longestStreak').textContent = longestStreak;
    document.getElementById('todayCompleted').textContent = todayCompleted;
    document.getElementById('todoCount').textContent = todoCount;
}

// Habits functions
function renderHabits() {
    const habitsList = document.getElementById('habitsList');
    const today = new Date().toISOString().split('T')[0];
    
    habitsList.innerHTML = habits.map(habit => {
        const isCompletedToday = habit.completedDates.includes(today);
        const weeklyCompletion = calculateWeeklyCompletion(habit);
        
        return `
            <div class="habit-card fade-in">
                <div class="habit-header">
                    <div>
                        <div class="habit-name">${habit.name}</div>
                        <span class="habit-category">${habit.category}</span>
                    </div>
                    <button class="btn btn-danger" onclick="deleteHabit(${habit.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
                <div class="habit-stats">
                    <div class="habit-stat">
                        <div class="habit-stat-value">${habit.streak}</div>
                        <div class="habit-stat-label">Day Streak</div>
                    </div>
                    <div class="habit-stat">
                        <div class="habit-stat-value">${weeklyCompletion}%</div>
                        <div class="habit-stat-label">This Week</div>
                    </div>
                    <div class="habit-stat">
                        <div class="habit-stat-value">${habit.completedDates.length}</div>
                        <div class="habit-stat-label">Total Days</div>
                    </div>
                </div>
                <div class="habit-actions">
                    <button class="btn ${isCompletedToday ? 'btn-success' : 'btn-outline'}" 
                            onclick="toggleHabit(${habit.id})"
                            ${isCompletedToday ? 'disabled' : ''}>
                        <i class="fas fa-check"></i>
                        ${isCompletedToday ? 'Completed Today' : 'Mark Complete'}
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function calculateWeeklyCompletion(habit) {
    const today = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    let completedThisWeek = 0;
    for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateString = date.toISOString().split('T')[0];
        if (habit.completedDates.includes(dateString)) {
            completedThisWeek++;
        }
    }
    
    return Math.round((completedThisWeek / 7) * 100);
}

function toggleHabit(habitId) {
    const habit = habits.find(h => h.id === habitId);
    const today = new Date().toISOString().split('T')[0];
    
    if (!habit.completedDates.includes(today)) {
        habit.completedDates.push(today);
        habit.streak++;
        habit.lastCompleted = today;
        
        saveHabits();
        renderHabits();
        renderStats();
    }
}

function deleteHabit(habitId) {
    if (confirm('Are you sure you want to delete this habit?')) {
        habits = habits.filter(h => h.id !== habitId);
        saveHabits();
        renderHabits();
        renderStats();
    }
}

function addHabit(event) {
    event.preventDefault();
    
    const name = document.getElementById('habitName').value;
    const category = document.getElementById('habitCategory').value;
    
    const newHabit = {
        id: Date.now(),
        name,
        category,
        streak: 0,
        completedDates: [],
        lastCompleted: null
    };
    
    habits.push(newHabit);
    saveHabits();
    renderHabits();
    renderStats();
    closeModal('addHabitModal');
    
    // Reset form
    document.getElementById('habitName').value = '';
}

// Calendar functions
function renderCalendar() {
    const calendar = document.getElementById('calendar');
    const currentMonth = document.getElementById('currentMonth');
    
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    currentMonth.textContent = new Date(year, month).toLocaleDateString('en-US', { 
        month: 'long', 
        year: 'numeric' 
    });
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    let calendarHTML = `
        <div class="calendar-grid">
            <div class="calendar-header">Sun</div>
            <div class="calendar-header">Mon</div>
            <div class="calendar-header">Tue</div>
            <div class="calendar-header">Wed</div>
            <div class="calendar-header">Thu</div>
            <div class="calendar-header">Fri</div>
            <div class="calendar-header">Sat</div>
    `;
    
    // Previous month's trailing days
    const prevMonth = new Date(year, month - 1, 0);
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
        const day = prevMonth.getDate() - i;
        calendarHTML += `
            <div class="calendar-day other-month">
                ${day}
            </div>
        `;
    }
    
    // Current month's days
    const today = new Date();
    const todayString = today.toISOString().split('T')[0];
    
    for (let day = 1; day <= daysInMonth; day++) {
        const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const isToday = dateString === todayString;
        const isSelected = selectedDate === dateString;
        const dayData = calendarData[dateString] || {};
        const stickers = dayData.stickers || [];
        
        calendarHTML += `
            <div class="calendar-day ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}" 
                 onclick="selectDate('${dateString}')">
                <div>${day}</div>
                <div class="day-stickers">
                    ${stickers.map(sticker => `<span class="day-sticker">${sticker}</span>`).join('')}
                </div>
            </div>
        `;
    }
    
    // Next month's leading days
    const remainingCells = 42 - (startingDayOfWeek + daysInMonth);
    for (let day = 1; day <= remainingCells && remainingCells < 7; day++) {
        calendarHTML += `
            <div class="calendar-day other-month">
                ${day}
            </div>
        `;
    }
    
    calendarHTML += '</div>';
    calendar.innerHTML = calendarHTML;
}

function selectDate(dateString) {
    selectedDate = dateString;
    renderCalendar();
}

function selectSticker(sticker) {
    selectedSticker = sticker;
    
    // Update sticker button states
    document.querySelectorAll('.sticker-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    event.target.classList.add('selected');
    
    // Add sticker to selected date
    if (selectedDate) {
        if (!calendarData[selectedDate]) {
            calendarData[selectedDate] = { stickers: [] };
        }
        
        if (!calendarData[selectedDate].stickers.includes(sticker)) {
            calendarData[selectedDate].stickers.push(sticker);
            saveCalendarData();
            renderCalendar();
        }
    }
}

function previousMonth() {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
}

function nextMonth() {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
}

// Todos functions
function renderTodos() {
    const todosList = document.getElementById('todosList');
    
    // Sort todos by due date and completion status
    const sortedTodos = [...todos].sort((a, b) => {
        if (a.completed !== b.completed) {
            return a.completed ? 1 : -1;
        }
        return new Date(a.dueDate) - new Date(b.dueDate);
    });
    
    todosList.innerHTML = sortedTodos.map(todo => {
        const dueDate = new Date(todo.dueDate);
        const today = new Date();
        const isOverdue = dueDate < today && !todo.completed;
        
        return `
            <div class="todo-card fade-in ${todo.completed ? 'todo-completed' : ''}">
                <input type="checkbox" class="todo-checkbox" 
                       ${todo.completed ? 'checked' : ''} 
                       onchange="toggleTodo(${todo.id})">
                <div class="todo-content">
                    <div class="todo-title">${todo.title}</div>
                    <div class="todo-meta">
                        <span><i class="fas fa-book"></i> ${todo.subject}</span>
                        <span class="${isOverdue ? 'text-red-600' : ''}">
                            <i class="fas fa-calendar"></i> 
                            ${dueDate.toLocaleDateString()}
                            ${isOverdue ? ' (Overdue)' : ''}
                        </span>
                        <span class="todo-priority ${todo.priority}">${todo.priority.toUpperCase()}</span>
                    </div>
                </div>
                <button class="btn btn-danger" onclick="deleteTodo(${todo.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
    }).join('');
}

function toggleTodo(todoId) {
    const todo = todos.find(t => t.id === todoId);
    todo.completed = !todo.completed;
    
    saveTodos();
    renderTodos();
    renderStats();
}

function deleteTodo(todoId) {
    if (confirm('Are you sure you want to delete this todo?')) {
        todos = todos.filter(t => t.id !== todoId);
        saveTodos();
        renderTodos();
        renderStats();
    }
}

function addTodo(event) {
    event.preventDefault();
    
    const title = document.getElementById('todoTitle').value;
    const subject = document.getElementById('todoSubject').value;
    const dueDate = document.getElementById('todoDueDate').value;
    const priority = document.getElementById('todoPriority').value;
    
    const newTodo = {
        id: Date.now(),
        title,
        subject,
        dueDate,
        priority,
        completed: false
    };
    
    todos.push(newTodo);
    saveTodos();
    renderTodos();
    renderStats();
    closeModal('addTodoModal');
    
    // Reset form
    document.getElementById('todoTitle').value = '';
    document.getElementById('todoSubject').value = '';
    document.getElementById('todoDueDate').value = '';
}

// Modal functions
function showAddHabitModal() {
    document.getElementById('addHabitModal').classList.add('show');
}

function showAddTodoModal() {
    document.getElementById('addTodoModal').classList.add('show');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('show');
}

// Close modal when clicking outside
document.addEventListener('click', function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.classList.remove('show');
    }
});

// Storage functions
function saveHabits() {
    localStorage.setItem('habits', JSON.stringify(habits));
}

function saveTodos() {
    localStorage.setItem('todos', JSON.stringify(todos));
}

function saveCalendarData() {
    localStorage.setItem('calendarData', JSON.stringify(calendarData));
}

// Keyboard shortcuts
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        document.querySelectorAll('.modal.show').forEach(modal => {
            modal.classList.remove('show');
        });
    }
});