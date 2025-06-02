// Inlined Storage class
class Storage {
  constructor() {
    if (!chrome.storage) {
      throw new Error('chrome.storage is not available');
    }
  }

  async get(key) {
    return new Promise((resolve) => {
      chrome.storage.local.get([key], (result) => {
        resolve(result[key]);
      });
    });
  }

  async set(key, value) {
    return new Promise((resolve) => {
      chrome.storage.local.set({ [key]: value }, () => {
        resolve();
      });
    });
  }

  async remove(key) {
    return new Promise((resolve) => {
      chrome.storage.local.remove([key], () => {
        resolve();
      });
    });
  }
}

// Inlined TaskManager class with uuidv4 function
function uuidv4() {
  // Simple UUID generator
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

class TaskManager {
  constructor(storage) {
    this.storage = storage;
    this.tasks = [];
  }

  async loadTasks() {
    const savedTasks = await this.storage.get('tasks');
    this.tasks = savedTasks || [];
  }

  async saveTasks() {
    await this.storage.set('tasks', this.tasks);
  }

  getTasks() {
    return this.tasks;
  }

  async addTask(task) {
    const newTask = {
      id: uuidv4(),
      title: task.title,
      description: task.description || '',
      dueDate: task.dueDate || null,
      priority: task.priority || 'medium',
      tags: task.tags || [],
      completed: task.completed || false,
      subtasks: task.subtasks || []
    };
    this.tasks.push(newTask);
    await this.saveTasks();
  }

  async updateTask(id, updatedFields) {
    const index = this.tasks.findIndex(t => t.id === id);
    if (index === -1) return;
    this.tasks[index] = { ...this.tasks[index], ...updatedFields };
    await this.saveTasks();
  }

  async deleteTask(id) {
    this.tasks = this.tasks.filter(t => t.id !== id);
    await this.saveTasks();
  }

  async toggleTaskCompletion(id) {
    const task = this.tasks.find(t => t.id === id);
    if (!task) return;
    task.completed = !task.completed;
    await this.saveTasks();
  }
}

// Inlined PomodoroTimer class
class PomodoroTimer {
  constructor() {
    this.workDuration = 25 * 60; // 25 minutes
    this.breakDuration = 5 * 60; // 5 minutes
    this.isRunning = false;
    this.isWorkSession = true;
    this.remainingTime = this.workDuration;
    this.intervalId = null;
    this.tickCallbacks = [];
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.intervalId = setInterval(() => {
      this.remainingTime--;
      this._notifyTick();
      if (this.remainingTime <= 0) {
        this._switchSession();
      }
    }, 1000);
  }

  reset() {
    this.isRunning = false;
    clearInterval(this.intervalId);
    this.intervalId = null;
    this.isWorkSession = true;
    this.remainingTime = this.workDuration;
    this._notifyTick();
  }

  onTick(callback) {
    if (typeof callback === 'function') {
      this.tickCallbacks.push(callback);
    }
  }

  _notifyTick() {
    const minutes = Math.floor(this.remainingTime / 60);
    const seconds = this.remainingTime % 60;
    const timeStr = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    this.tickCallbacks.forEach(cb => cb(timeStr));
  }

  _switchSession() {
    this.isWorkSession = !this.isWorkSession;
    this.remainingTime = this.isWorkSession ? this.workDuration : this.breakDuration;
    this._notifyTick();
  }
}

// Inlined ThemeManager class
class ThemeManager {
  constructor() {
    this.themeKey = 'theme';
  }

  initTheme() {
    // Always apply dark theme by default
    this.applyTheme('dark');
  }

  toggleTheme() {
    // Disable toggle functionality since only dark theme is used
  }

  applyTheme(theme) {
    if (theme === 'dark') {
      document.body.classList.add('dark-theme');
      document.body.classList.remove('light-theme');
    } else {
      document.body.classList.add('light-theme');
      document.body.classList.remove('dark-theme');
    }
    localStorage.setItem(this.themeKey, theme);
  }
}

const storage = new Storage();
const taskManager = new TaskManager(storage);
const pomodoroTimer = new PomodoroTimer();
const themeManager = new ThemeManager();

document.addEventListener('DOMContentLoaded', async () => {
  // Initialize theme
  themeManager.initTheme();

  const themeToggleBtn = document.getElementById('theme-toggle');

  // Set icon to moon only since dark theme is default and toggle disabled
  themeToggleBtn.textContent = '🌙';

  // Remove click event listener since toggle is disabled

  // Load tasks and render
  await taskManager.loadTasks();
  renderTaskList();

  // Setup form submit
  const taskForm = document.getElementById('task-form');
  taskForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('task-title').value.trim();
    const description = document.getElementById('task-desc').value.trim();
    const dueDate = document.getElementById('task-due-date').value;
    const priority = document.getElementById('task-priority').value;
    const tags = document.getElementById('task-tags').value.split(',').map(t => t.trim()).filter(t => t);

    if (!title) {
      alert('Task title is required');
      return;
    }

    await taskManager.addTask({
      title,
      description,
      dueDate,
      priority,
      tags,
      completed: false,
      subtasks: []
    });

    taskForm.reset();
    renderTaskList();
  });

  // Setup filters
  document.getElementById('filter-sort').addEventListener('change', renderTaskList);
  document.getElementById('filter-status').addEventListener('change', renderTaskList);

  // Setup pomodoro buttons
  document.getElementById('pomodoro-start').addEventListener('click', () => {
    pomodoroTimer.start();
  });
  document.getElementById('pomodoro-reset').addEventListener('click', () => {
    pomodoroTimer.reset();
  });

  // Subscribe to pomodoro timer updates
  pomodoroTimer.onTick((timeStr) => {
    document.getElementById('timer-display').textContent = timeStr;
  });
});

function renderTaskList() {
  const filterSort = document.getElementById('filter-sort').value;
  const filterStatus = document.getElementById('filter-status').value;

  let tasks = taskManager.getTasks();

  // Filter by status
  if (filterStatus === 'completed') {
    tasks = tasks.filter(t => t.completed);
  } else if (filterStatus === 'pending') {
    tasks = tasks.filter(t => !t.completed);
  }

  // Sort tasks
  if (filterSort === 'dueDate') {
    tasks.sort((a, b) => {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate) - new Date(b.dueDate);
    });
  } else if (filterSort === 'priority') {
    const priorityOrder = { high: 1, medium: 2, low: 3 };
    tasks.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  } else if (filterSort === 'tags') {
    tasks.sort((a, b) => {
      const aTags = a.tags.join(',').toLowerCase();
      const bTags = b.tags.join(',').toLowerCase();
      return aTags.localeCompare(bTags);
    });
  }

  const taskList = document.getElementById('task-list');
  taskList.innerHTML = '';

  tasks.forEach(task => {
    const li = document.createElement('li');
    li.className = 'task-item' + (task.completed ? ' completed' : '');
    li.dataset.id = task.id;

    const leftDiv = document.createElement('div');
    leftDiv.className = 'task-left';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = task.completed;
    checkbox.addEventListener('change', async () => {
      await taskManager.toggleTaskCompletion(task.id);
      renderTaskList();
    });

    const titleSpan = document.createElement('span');
    titleSpan.textContent = task.title;
    titleSpan.className = 'task-title';

    leftDiv.appendChild(checkbox);
    leftDiv.appendChild(titleSpan);

    const rightDiv = document.createElement('div');
    rightDiv.className = 'task-right';

    const editBtn = document.createElement('button');
    editBtn.textContent = 'Edit';
    editBtn.className = 'btn-link edit-btn';
    editBtn.addEventListener('click', () => {
      openEditTaskModal(task);
    });

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.className = 'btn-link delete-btn';
    deleteBtn.addEventListener('click', async () => {
      if (confirm('Delete this task?')) {
        await taskManager.deleteTask(task.id);
        renderTaskList();
      }
    });

    rightDiv.appendChild(editBtn);
    rightDiv.appendChild(deleteBtn);

    li.appendChild(leftDiv);
    li.appendChild(rightDiv);

    taskList.appendChild(li);
  });
}

function openEditTaskModal(task) {
  // For simplicity, reuse the add task form for editing
  const taskForm = document.getElementById('task-form');
  document.getElementById('task-title').value = task.title;
  document.getElementById('task-desc').value = task.description;
  document.getElementById('task-due-date').value = task.dueDate || '';
  document.getElementById('task-priority').value = task.priority;
  document.getElementById('task-tags').value = task.tags.join(', ');

  // Change add button to save button
  const addButton = taskForm.querySelector('button[type="submit"]');
  addButton.textContent = 'Save Task';

  // Remove previous submit listener and add new one for editing
  taskForm.onsubmit = async (e) => {
    e.preventDefault();
    const title = document.getElementById('task-title').value.trim();
    const description = document.getElementById('task-desc').value.trim();
    const dueDate = document.getElementById('task-due-date').value;
    const priority = document.getElementById('task-priority').value;
    const tags = document.getElementById('task-tags').value.split(',').map(t => t.trim()).filter(t => t);

    if (!title) {
      alert('Task title is required');
      return;
    }

    await taskManager.updateTask(task.id, {
      title,
      description,
      dueDate,
      priority,
      tags
    });

    taskForm.reset();
    addButton.textContent = 'Add Task';
    taskForm.onsubmit = null;
    renderTaskList();
  };
}
