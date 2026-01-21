import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

import { LoadingView } from './LoadingView.tsx';

describe('LoadingView', () => {
    it('should render connecting state', () => {
        render(<LoadingView status="starting" onRetry={() => { }} />);
        expect(screen.getByText(/Initializing Engine/i)).toBeInTheDocument();
        // expect(screen.getByText(/LOADING/i)).toBeInTheDocument();
    });

    it('should render error state with retry button', () => {
        const handleRetry = vi.fn();
        render(<LoadingView status="error" onRetry={handleRetry} />);
        expect(screen.getByText(/Connection Failed/i)).toBeInTheDocument();

        const retryBtn = screen.getByRole('button', { name: /Thử lại/i });
        fireEvent.click(retryBtn);
        expect(handleRetry).toHaveBeenCalled();
    });
});
