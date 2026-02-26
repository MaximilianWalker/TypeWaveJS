import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, act } from '@testing-library/react';
import { TypeWave } from './index';

async function advance(ms = 0) {
  await act(async () => {
    vi.advanceTimersByTime(ms);
  });
}

describe('TypeWave component', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it('types text over time', async () => {
    const { container } = render(
      <TypeWave
        showCursor={false}
        events={[{ type: 'type', value: 'Hi', speed: 5 }]}
      />
    );

    expect(container.textContent).toBe('');

    await advance(5);
    expect(container.textContent).toBe('H');

    await advance(5);
    expect(container.textContent).toBe('Hi');
  });

  it('handles instant type events immediately', async () => {
    const { container } = render(
      <TypeWave
        showCursor={false}
        events={[{ type: 'type', value: 'Hello', instant: true }]}
      />
    );

    await advance(0);
    expect(container.textContent).toBe('Hello');
  });

  it('respects pause duration before continuing', async () => {
    const { container } = render(
      <TypeWave
        showCursor={false}
        events={[
          { type: 'type', value: 'A', instant: true },
          { type: 'pause', value: 100 },
          { type: 'type', value: 'B', instant: true }
        ]}
      />
    );

    await advance(0);
    expect(container.textContent).toBe('A');

    await advance(99);
    expect(container.textContent).toBe('A');

    await advance(1);
    await advance(0);
    expect(container.textContent.startsWith('AB')).toBe(true);
  });

  it('fires lifecycle callbacks and execute events', async () => {
    const onEvent = vi.fn();
    const onAnimation = vi.fn();
    const onEnd = vi.fn();
    const executeCallback = vi.fn();

    render(
      <TypeWave
        showCursor={false}
        events={[
          { type: 'type', value: 'A', instant: true },
          { type: 'pause', value: 10 },
          { type: 'execute', value: executeCallback }
        ]}
        onEvent={onEvent}
        onAnimation={onAnimation}
        onEnd={onEnd}
      />
    );

    await advance(0);
    await advance(10);
    await advance(0);

    expect(executeCallback).toHaveBeenCalledTimes(1);

    const onEventTypes = onEvent.mock.calls.map(([event]) => event.type);
    const onAnimationTypes = onAnimation.mock.calls.map(([event]) => event.type);

    expect(onEventTypes).toEqual(['type', 'pause', 'execute']);
    expect(onAnimationTypes).toEqual(['type', 'pause', 'execute']);
    expect(onEnd).toHaveBeenCalledTimes(1);
  });

  it('does not animate while play is false and resumes when true', async () => {
    const events = [{ type: 'type', value: 'Resume', instant: true }];

    const { container, rerender } = render(
      <TypeWave showCursor={false} play={false} events={events} />
    );

    await advance(0);
    expect(container.textContent).toBe('');

    rerender(<TypeWave showCursor={false} play events={events} />);

    await advance(0);
    expect(container.textContent).toBe('Resume');
  });

  it('processes loop events without reaching end state', async () => {
    const onEvent = vi.fn();
    const onEnd = vi.fn();

    const { container } = render(
      <TypeWave
        showCursor={false}
        onEvent={onEvent}
        onEnd={onEnd}
        events={[
          { type: 'type', value: 'AB', speed: 5 },
          { type: 'loop', value: 0 }
        ]}
      />
    );

    await advance(5);
    expect(container.textContent).toBe('A');

    await advance(5);
    expect(container.textContent.startsWith('AB')).toBe(true);

    await advance(0);
    await advance(20);

    expect(container.textContent.startsWith('AB')).toBe(true);
    expect(onEvent.mock.calls.map(([event]) => event.type)).toContain('loop');
    expect(onEnd).not.toHaveBeenCalled();
  });

  it('inserts and auto-removes priority events at runtime', async () => {
    const onEvent = vi.fn();
    const baseEvents = [
      { type: 'type', value: 'A', instant: true },
      { type: 'pause', value: 50 },
      { type: 'type', value: 'B', instant: true }
    ];

    const { container, rerender } = render(
      <TypeWave showCursor={false} events={baseEvents} onEvent={onEvent} />
    );

    await advance(0);
    expect(container.textContent).toBe('A');

    rerender(
      <TypeWave
        showCursor={false}
        events={baseEvents}
        priorityEvents={[{ type: 'type', value: 'X', instant: true }]}
        onEvent={onEvent}
      />
    );

    await advance(0);
    expect(container.textContent).toBe('AX');

    await advance(50);
    await advance(0);
    expect(container.textContent).toBe('AXB');

    const typeEvents = onEvent.mock.calls
      .map(([event]) => event.type)
      .filter((type) => type === 'type');
    expect(typeEvents).toEqual(['type', 'type', 'type']);
  });

  it('handles mixed type, move, and delete cursor chain', async () => {
    const { container } = render(
      <TypeWave
        showCursor={false}
        events={[
          { type: 'type', value: 'Hello', instant: true },
          { type: 'move', value: -2, speed: 5 },
          { type: 'type', value: 'X', instant: true },
          { type: 'delete', value: 2, speed: 5 }
        ]}
      />
    );

    await advance(0);

    expect(container.textContent).toBe('Hello');

    await advance(5);
    expect(container.textContent).toBe('Hello');

    await advance(5);
    await advance(0);
    expect(container.textContent).toBe('HelXlo');

    await advance(5);
    expect(container.textContent).toBe('Hello');

    await advance(5);
    expect(container.textContent).toBe('Helo');
  });

  it('clamps oversized left move to text start before typing', async () => {
    const { container } = render(
      <TypeWave
        showCursor={false}
        events={[
          { type: 'type', value: 'Hello', instant: true },
          { type: 'move', value: -999, instant: true },
          { type: 'type', value: 'X', instant: true }
        ]}
      />
    );

    await advance(0);
    await advance(0);
    await advance(0);

    expect(container.textContent).toBe('XHello');
  });
});
