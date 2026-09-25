// Setup mock localStorage & window for Node environment
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

const listeners: Record<string, Function[]> = {};
if (typeof window === 'undefined') {
  (global as any).window = global;
}
global.window.addEventListener = (event: string, cb: any) => {
  listeners[event] = listeners[event] || [];
  listeners[event].push(cb);
};
global.window.removeEventListener = (event: string, cb: any) => {
  if (listeners[event]) {
    listeners[event] = listeners[event].filter(fn => fn !== cb);
  }
};
global.window.dispatchEvent = (event: any) => {
  const eventName = typeof event === 'string' ? event : event?.type;
  const list = listeners[eventName] || [];
  list.forEach(fn => fn(event));
  return true;
};

import {
  saveActivity,
  getAllActivities,
  deleteActivity,
  getAllTimeTotal,
} from '../lib/storage';

describe('deleteActivity storage functionality', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('successfully deletes a targeted activity and leaves others intact', () => {
    const act1 = saveActivity('car', 10);
    const act2 = saveActivity('electricity', 50);
    const act3 = saveActivity('veg_meal', 3);

    expect(getAllActivities()).toHaveLength(3);

    const deleted = deleteActivity(act2.id);
    expect(deleted).not.toBeNull();
    expect(deleted?.id).toBe(act2.id);

    const remaining = getAllActivities();
    expect(remaining).toHaveLength(2);
    expect(remaining.map(a => a.id)).toEqual([act3.id, act1.id]);
    expect(remaining.find(a => a.id === act2.id)).toBeUndefined();
  });

  test('returns null when deleting a nonexistent activity ID without mutating state', () => {
    const act1 = saveActivity('car', 10);
    const deleted = deleteActivity('nonexistent-id-999');
    expect(deleted).toBeNull();
    expect(getAllActivities()).toHaveLength(1);
    expect(getAllActivities()[0].id).toBe(act1.id);
  });

  test('deleting an activity updates total CO2 calculations immediately', () => {
    const act1 = saveActivity('car', 10); // 10 * 0.20 = 2.0 kg
    const act2 = saveActivity('flight', 100); // 100 * 0.25 = 25.0 kg

    const initialTotal = getAllTimeTotal();
    expect(initialTotal).toBe(27.0);

    deleteActivity(act2.id);

    const updatedTotal = getAllTimeTotal();
    expect(updatedTotal).toBe(2.0);
  });

  test('dispatches planetpulse_storage event upon deletion', () => {
    const act = saveActivity('car', 10);
    const listener = jest.fn();
    window.addEventListener('planetpulse_storage', listener);

    deleteActivity(act.id);
    expect(listener).toHaveBeenCalled();

    window.removeEventListener('planetpulse_storage', listener);
  });
});
