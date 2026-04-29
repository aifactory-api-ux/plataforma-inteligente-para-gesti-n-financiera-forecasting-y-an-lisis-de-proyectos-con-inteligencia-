import { create } from "zustand";

interface UIState {
  sidebarOpen: boolean;
  chatPanelOpen: boolean;
  modalOpen: boolean;
  activeModal: string | null;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setChatPanelOpen: (open: boolean) => void;
  toggleChatPanel: () => void;
  setModalOpen: (open: boolean, modalId?: string) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  chatPanelOpen: false,
  modalOpen: false,
  activeModal: null,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setChatPanelOpen: (open) => set({ chatPanelOpen: open }),
  toggleChatPanel: () => set((state) => ({ chatPanelOpen: !state.chatPanelOpen })),
  setModalOpen: (open, modalId) => set({ modalOpen: open, activeModal: modalId || null }),
}));
