export class PomodoroTimer {
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
    // Optionally, notify user with chrome.notifications here
  }
}
