import { PomodoroTimer } from '../modules/pomodoroTimer.js';

jest.useFakeTimers();

describe('PomodoroTimer', () => {
  let timer;

  beforeEach(() => {
    timer = new PomodoroTimer();
  });

  test('initial state', () => {
    expect(timer.isRunning).toBe(false);
    expect(timer.isWorkSession).toBe(true);
    expect(timer.remainingTime).toBe(25 * 60);
  });

  test('start and tick', () => {
    const tickCallback = jest.fn();
    timer.onTick(tickCallback);
    timer.start();

    expect(timer.isRunning).toBe(true);

    jest.advanceTimersByTime(1000);
    expect(tickCallback).toHaveBeenCalled();

    timer.reset();
    expect(timer.isRunning).toBe(false);
    expect(timer.remainingTime).toBe(25 * 60);
  });

  test('switch session after time ends', () => {
    timer.remainingTime = 1;
    timer.start();

    jest.advanceTimersByTime(1000);

    expect(timer.isWorkSession).toBe(false);
    expect(timer.remainingTime).toBe(5 * 60);
  });
});
