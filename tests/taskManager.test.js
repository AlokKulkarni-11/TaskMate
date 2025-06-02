import { TaskManager } from '../modules/taskManager.js';

class MockStorage {
  constructor() {
    this.store = {};
  }
  async get(key) {
    return this.store[key];
  }
  async set(key, value) {
    this.store[key] = value;
  }
  async remove(key) {
    delete this.store[key];
  }
}

describe('TaskManager', () => {
  let taskManager;
  let storage;

  beforeEach(async () => {
    storage = new MockStorage();
    taskManager = new TaskManager(storage);
    await taskManager.loadTasks();
  });

  test('adds a task', async () => {
    await taskManager.addTask({ title: 'Test Task' });
    const tasks = taskManager.getTasks();
    expect(tasks.length).toBe(1);
    expect(tasks[0].title).toBe('Test Task');
  });

  test('updates a task', async () => {
    await taskManager.addTask({ title: 'Old Title' });
    const task = taskManager.getTasks()[0];
    await taskManager.updateTask(task.id, { title: 'New Title' });
    const updatedTask = taskManager.getTasks()[0];
    expect(updatedTask.title).toBe('New Title');
  });

  test('deletes a task', async () => {
    await taskManager.addTask({ title: 'Task to delete' });
    const task = taskManager.getTasks()[0];
    await taskManager.deleteTask(task.id);
    expect(taskManager.getTasks().length).toBe(0);
  });

  test('toggles task completion', async () => {
    await taskManager.addTask({ title: 'Incomplete Task' });
    const task = taskManager.getTasks()[0];
    expect(task.completed).toBe(false);
    await taskManager.toggleTaskCompletion(task.id);
    expect(taskManager.getTasks()[0].completed).toBe(true);
  });
});
