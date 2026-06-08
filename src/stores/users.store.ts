import { create } from "zustand";
import type { UserRow } from "@/lib/users/queries";

type DialogState =
  | { type: "edit"; userId: string; userName: string; currentName: string }
  | { type: "delete"; userId: string; userName: string }
  | { type: "remove-admin"; userId: string; userName: string }
  | null;

type UsersStore = {
  dialog: DialogState;
  editName: string;
  openEdit: (u: UserRow) => void;
  openDelete: (u: UserRow) => void;
  openRemoveAdmin: (u: UserRow) => void;
  closeDialog: () => void;
  setEditName: (name: string) => void;
};

export const useUsersStore = create<UsersStore>((set) => ({
  dialog: null,
  editName: "",
  openEdit: (u) =>
    set({
      dialog: { type: "edit", userId: u.id, userName: u.name, currentName: u.name },
      editName: u.name,
    }),
  openDelete: (u) => set({ dialog: { type: "delete", userId: u.id, userName: u.name } }),
  openRemoveAdmin: (u) => set({ dialog: { type: "remove-admin", userId: u.id, userName: u.name } }),
  closeDialog: () => set({ dialog: null, editName: "" }),
  setEditName: (name) => set({ editName: name }),
}));
