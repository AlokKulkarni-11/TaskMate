import { v4 as uuidv4 } from 'https://jspm.dev/uuid';

export class TaskManager {
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
