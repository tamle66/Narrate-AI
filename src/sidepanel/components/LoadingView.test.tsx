import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

import { LoadingView } from './LoadingView.tsx';

describe('LoadingView', () => {
    it('should render connecting state', () => {
        render(<LoadingView status="starting" onRetry={() => { }} />);
        expect(screen.getByRole('heading', { name: /Kokoro Engine/i })).toBeInTheDocument();
        expect(screen.getByText(/Connecting/i)).toBeInTheDocument();
    });

    it('should render error state with retry button', () => {
        const handleRetry = vi.fn();
        render(<LoadingView status="error" onRetry={handleRetry} />);
        expect(screen.getByText(/ERROR/i)).toBeInTheDocument();

        const retryBtn = screen.getByRole('button', { name: /Kiểm tra kết nối ngay/i });
        fireEvent.click(retryBtn);
        expect(handleRetry).toHaveBeenCalled();
    });
});
