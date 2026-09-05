import { activeWindow } from './maintenance-notice.component';

describe('activeWindow', () => {
  const w = { startsAt: '2024-03-10T06:00:00Z', endsAt: '2024-03-10T08:00:00Z', message: 'Planned maintenance' };

  it('is null without a window', () => {
    expect(activeWindow(null)).toBeNull();
  });

  it('shows from a day before until the window closes', () => {
    expect(activeWindow(w, Date.parse('2024-03-08T06:00:00Z'))).toBeNull();
    expect(activeWindow(w, Date.parse('2024-03-09T06:00:01Z'))).toBe(w);
    expect(activeWindow(w, Date.parse('2024-03-10T07:59:00Z'))).toBe(w);
    expect(activeWindow(w, Date.parse('2024-03-10T08:00:01Z'))).toBeNull();
  });
});
