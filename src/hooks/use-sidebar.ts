import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { produce } from "immer";

type SidebarSettings = {
  disabled: boolean;
  isHoverOpen: boolean;
};

type SidebarStore = {
  isOpen: boolean;
  isHover: boolean;
  settings: SidebarSettings;

  toggleOpen: () => void;
  setIsOpen: (isOpen: boolean) => void;
  setIsHover: (isHover: boolean) => void;
  getOpenState: () => boolean;
  setSettings: (settings: Partial<SidebarSettings>) => void;
};

export const useSidebar = create<SidebarStore>()(
  persist(
    (set, get) => ({
      isOpen: true,
      isHover: false,
      settings: {
        disabled: false,
        isHoverOpen: false,
      },

      toggleOpen: () => {
        set({ isOpen: !get().isOpen });
      },

      setIsOpen: (isOpen) => {
        set({ isOpen });
      },

      setIsHover: (isHover) => {
        set({ isHover });
      },

      getOpenState: () => {
        return get().isOpen || (get().settings.isHoverOpen && get().isHover);
      },

      setSettings: (settings) => {
        set(
          produce((state: SidebarStore) => {
            state.settings = {
              ...state.settings,
              ...settings,
            };
          }),
        );
      },
    }),
    {
      name: "sidebar",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
