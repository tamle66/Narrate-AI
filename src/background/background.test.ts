import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock chrome API
const chromeMock = {
    contextMenus: {
        create: vi.fn(),
        onClicked: {
            addListener: vi.fn(),
        },
    },
    runtime: {
        onInstalled: {
            addListener: vi.fn(),
        },
        sendNativeMessage: vi.fn(),
    },
    sidePanel: {
        open: vi.fn(),
        setPanelBehavior: vi.fn().mockResolvedValue(undefined),
    }
};

global.chrome = chromeMock as any;

// We will import the functions after creating the file
// But for Red phase, we expect the file to exist and export these functions

describe('Background Service', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should register context menu items on install', async () => {
        const { setupContextMenu } = await import('./index');
        setupContextMenu();

        expect(chromeMock.contextMenus.create).toHaveBeenCalledWith({
            id: 'read_selection',
            title: 'Đọc đoạn đã chọn',
            contexts: ['selection']
        });

        expect(chromeMock.contextMenus.create).toHaveBeenCalledWith({
            id: 'read_from_here',
            title: 'Đọc từ đây đến hết trang',
            contexts: ['selection']
        });
    });
});
