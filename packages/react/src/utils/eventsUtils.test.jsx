import { describe, it, expect, vi } from 'vitest';
import { EVENT_TYPES, processEvent, processEvents } from './eventsUtils';

describe('EVENT_TYPES', () => {
    it('includes execute as a supported event type', () => {
        expect(EVENT_TYPES).toContain('execute');
    });
});

describe('processEvent', () => {
    it('keeps execute event callbacks unchanged', () => {
        const callback = vi.fn();
        const event = processEvent({ type: 'execute', value: callback });

        expect(event.type).toBe('execute');
        expect(event.value).toBe(callback);
        expect(event.animation).toBeUndefined();
        expect(event.remove).toBe(false);
    });

    it('marks priority execute events as removable by default', () => {
        const callback = vi.fn();
        const event = processEvent({ type: 'execute', value: callback }, true);

        expect(event.priority).toBe(true);
        expect(event.remove).toBe(true);
    });
});

describe('processEvents', () => {
    it('processes execute events in event arrays', () => {
        const callback = vi.fn();
        const events = processEvents([
            { type: 'pause', value: 100 },
            { type: 'execute', value: callback }
        ]);

        expect(events[1].type).toBe('execute');
        expect(events[1].value).toBe(callback);
    });
});
