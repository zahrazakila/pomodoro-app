let pomodoroTime = 25 * 60;
let shortBreakTime = 5 * 60;
let longBreakTime = 15 * 60;
let pomodoroCount = 0;

let interval;

// Set Custom Timer
document.querySelector('#set-timer').addEventListener('click', () => {
    // Ambil nilai input dan konversi ke detik
    pomodoroTime = document.querySelector('#pomodoro-time').value * 60;
    shortBreakTime = document.querySelector('#short-break-time').value * 60;
    longBreakTime = document.querySelector('#long-break-time').value * 60;

    // Update tampilan timer dengan waktu baru
    currentTimer = pomodoroTime;
    updateTimerDisplay(currentTimer);

    // Munculkan tombol "Start Timer"
    document.querySelector('#start-timer').classList.remove('hidden');
});

// Fungsi untuk memperbarui tampilan timer di layar
function updateTimerDisplay(timeInSeconds) {
    const display = document.querySelector('#timer-display');
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    display.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

// Start Timer (Countdown)
document.querySelector('#start-timer').addEventListener('click', () => {
    if (!selectedPlaylist) {
        alert('Please select a playlist first!');
        return;  // Stop di sini jika tidak ada playlist
    }

    playSpotify()
    .then(() => {
        startPomodoro(pomodoroTime, 'focus');  // Timer berjalan setelah Spotify berhasil
    })

});




function startPomodoro(duration, mode) {
    clearInterval(interval);
    let timer = duration;
    const display = document.getElementById('timer-display');

    interval = setInterval(() => {
        const minutesLeft = Math.floor(timer / 60);
        const secondsLeft = timer % 60;
        display.textContent = `${minutesLeft}:${secondsLeft < 10 ? '0' : ''}${secondsLeft}`;

        if (--timer < 0) {
            clearInterval(interval);
            
            if (mode === 'focus') {
                pomodoroCount++;
                if (pomodoroCount % 4 === 0) {
                    pauseSpotify();  // Pause during long break
                    alert('Time for a long break!');
                    startPomodoro(longBreakTime, 'long');
                } else {
                    pauseSpotify();  // Pause during short break
                    alert('Take a short break!');
                    startPomodoro(shortBreakTime, 'short');
                }
            } else {
                resumeSpotify();  // Resume Spotify when returning to work
                alert('Break is over! Back to work!');
                startPomodoro(pomodoroTime, 'focus');
                
            }
        }
    }, 1000);
}

// To-Do List
let tasks = [];
document.querySelector('#add-task').addEventListener('click', (e) => {
    e.preventDefault();  // Cegah form submit
    const taskInput = document.querySelector('#task');  // Tangkap input

    console.log('Task input:', taskInput.value);  // Debugging isi input

    if (taskInput && taskInput.value.trim() !== '') {
        saveTask(taskInput.value);  // Simpan task
        taskInput.value = '';  // Kosongkan input setelah ditambah
    } else {
        alert('Task cannot be empty');
        taskInput.focus();  // Fokus ke input
    }
});

function renderTasks() {
    const taskList = document.querySelector('#tasks');
    taskList.innerHTML = '';
    tasks.forEach((task, index) => {
        taskList.innerHTML += `
            <li class="flex justify-between p-2 bg-gray-100 rounded-lg">
                <span>${task}</span>
                <button class="text-red-500" onclick="removeTask(${index})">Remove</button>
            </li>
        `;
    });
}

function removeTask(index) {
    tasks.splice(index, 1);
    renderTasks();
}

const inputs = document.querySelectorAll('#task');
console.log('Found inputs:', inputs);

// Ambil data saat halaman dimuat
window.addEventListener('DOMContentLoaded', fetchTasks);

// Ambil semua tugas dari database
function fetchTasks() {
    fetch('/tasks')
        .then(response => response.json())
        .then(data => {
            console.log('Tasks fetched:', data);  // Debugging
            tasks = data;
            renderTasks();
        })
        .catch(err => {
            console.error('Failed to fetch tasks:', err);
        });
}

// Simpan tugas baru ke database
function saveTask(task) {
    fetch('/tasks', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ task })
    })
    .then(response => response.json())
    .then(newTask => {
        tasks.unshift(newTask);  // Tambahkan ke awal list
        renderTasks();
    })
    .catch(err => {
        console.error('Failed to add task:', err);
    });
}


// Render semua tugas ke halaman
function renderTasks() {
    const taskList = document.querySelector('#tasks');
    taskList.innerHTML = '';

    tasks.forEach(task => {
        const isCompleted = task.is_completed ? 'line-through text-gray-400' : '';
        taskList.innerHTML += `
            <li class="flex justify-between p-4 bg-gray-100 rounded-lg shadow-sm ${isCompleted}">
                <span>${task.task_name}</span>  <!-- Pastikan ini 'task_name' bukan 'task' -->
                <div>
                    ${task.is_completed ? '' : `<button class="text-blue-500" onclick="completeTask(${task.id})">Complete</button>`}
                    <button class="text-red-500 ml-4" onclick="deleteTask(${task.id})">Remove</button>
                </div>
            </li>
        `;
    });
}

// Tandai tugas sebagai selesai
function completeTask(id) {
    fetch(`/tasks/${id}`, {
        method: 'PUT'
    })
    .then(() => {
        tasks = tasks.map(task => task.id === id ? { ...task, is_completed: 1 } : task);
        renderTasks();
    })
    .catch(err => {
        console.error('Failed to complete task:', err);
    });
}

// Hapus tugas dari database
function deleteTask(id) {
    fetch(`/tasks/${id}`, {
        method: 'DELETE'
    })
    .then(() => {
        tasks = tasks.filter(task => task.id !== id);
        renderTasks();
    })
    .catch(err => {
        console.error('Failed to delete task:', err);
    });
}
