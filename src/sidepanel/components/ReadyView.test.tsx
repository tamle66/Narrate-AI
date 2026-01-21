import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

import { ReadyView } from './ReadyView.tsx';

describe('ReadyView', () => {
    it('should render ready state with action button', () => {
        const handleScan = vi.fn();
        render(<ReadyView onScanPage={handleScan} />);

        expect(screen.getByText(/System Ready/i)).toBeInTheDocument();
        expect(screen.getByText(/Sẵn sàng phát/i)).toBeInTheDocument();

        const scanBtn = screen.getByRole('button', { name: /Đọc trang hiện tại/i });
        fireEvent.click(scanBtn);
        expect(handleScan).toHaveBeenCalled();
    });
});
