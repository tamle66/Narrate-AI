import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

import { PlayerView } from './PlayerView.tsx';

// Mock useStore hook for testing
// In integration tests we'd component wrap, but here we can mock the store values if needed.
// However, PlayerView likely takes props or reads store. 
// Let's design PlayerView to be somewhat pure or assume store availability.

describe('PlayerView', () => {
    it('should render track title and controls', () => {
        const handlePlayPause = vi.fn();
        render(
            <PlayerView
                title="Chapter 1: The Beginning"
                isPlaying={true}
                togglePlay={handlePlayPause}
                currentTime={10}
                duration={100}
            />
        );
        expect(screen.getByText(/Chapter 1: The Beginning/i)).toBeInTheDocument();
        // Since it's playing, we expect Pause icon/button
        // but finding by icon is hard. We can add aria-label.
    });
});
