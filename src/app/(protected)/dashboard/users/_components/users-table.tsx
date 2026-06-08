"use client";

import { MoreHorizontal, Pencil, ShieldOff, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDeleteUser, useSetUserRole, useUpdateUserName } from "@/hooks/use-users";
import { formatDate } from "@/lib/date";
import type { UserRow } from "@/lib/users/queries";
import { useUsersStore } from "@/stores/users.store";

export function UsersTable({ rows }: { rows: UserRow[] }) {
  const { dialog, editName, openEdit, openDelete, openRemoveAdmin, closeDialog, setEditName } =
    useUsersStore();

  const updateName = useUpdateUserName();
  const setRole = useSetUserRole();
  const deleteUser = useDeleteUser();

  const submitting = updateName.isPending || setRole.isPending || deleteUser.isPending;

  async function handleConfirm() {
    if (!dialog) return;
    if (dialog.type === "edit") {
      await updateName.mutateAsync({ userId: dialog.userId, name: editName });
    } else if (dialog.type === "delete") {
      await deleteUser.mutateAsync(dialog.userId);
    } else if (dialog.type === "remove-admin") {
      await setRole.mutateAsync({ userId: dialog.userId, role: "user" });
    }
    closeDialog();
  }

  if (rows.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
        No users found.
      </div>
    );
  }

  return (
    <>
      <table className="w-full text-sm">
        <colgroup>
          <col className="w-auto" />
          <col className="hidden sm:table-column w-36" />
          <col className="w-16" />
        </colgroup>
        <thead>
          <tr className="border-b border-border">
            <th className="pb-2 px-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
              User
            </th>
            <th className="pb-2 px-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide hidden sm:table-cell">
              Joined
            </th>
            <th className="pb-2 px-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((u) => (
            <tr key={u.id} className="hover:bg-muted/40 transition-colors">
              <td className="py-3 px-3">
                <div className="flex flex-col min-w-0">
                  <span className="font-medium truncate">{u.name}</span>
                  <span className="text-xs text-muted-foreground truncate">{u.email}</span>
                </div>
              </td>
              <td className="py-3 px-3 hidden sm:table-cell text-xs tabular-nums text-muted-foreground whitespace-nowrap">
                {formatDate(u.createdAt)}
              </td>
              <td className="py-3 px-3 text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7"
                      aria-label={`Actions for ${u.name}`}
                    >
                      <MoreHorizontal className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => openEdit(u)}>
                      <Pencil className="size-3.5 mr-2" />
                      Edit name
                    </DropdownMenuItem>
                    {u.role === "admin" && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => openRemoveAdmin(u)}>
                          <ShieldOff className="size-3.5 mr-2" />
                          Remove as admin
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => openDelete(u)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="size-3.5 mr-2" />
                      Delete user
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Edit name dialog */}
      <Dialog
        open={dialog?.type === "edit"}
        onOpenChange={(open) => {
          if (!open) closeDialog();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit name</DialogTitle>
            <DialogDescription>
              Update the full name for {dialog?.type === "edit" ? dialog.currentName : ""}.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2 py-2">
            <Label htmlFor="edit-name">Full name</Label>
            <Input
              id="edit-name"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              autoComplete="off"
              onKeyDown={(e) => {
                if (e.key === "Enter" && editName.trim()) handleConfirm();
              }}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog} disabled={submitting}>
              Cancel
            </Button>
            <Button onClick={handleConfirm} disabled={submitting || !editName.trim()}>
              {submitting ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove admin dialog */}
      <Dialog
        open={dialog?.type === "remove-admin"}
        onOpenChange={(open) => {
          if (!open) closeDialog();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove admin access?</DialogTitle>
            <DialogDescription>
              {dialog?.type === "remove-admin" ? dialog.userName : ""} will lose dashboard access
              and all admin privileges.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog} disabled={submitting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirm} disabled={submitting}>
              {submitting ? "Removing…" : "Remove access"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete user dialog */}
      <Dialog
        open={dialog?.type === "delete"}
        onOpenChange={(open) => {
          if (!open) closeDialog();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete user?</DialogTitle>
            <DialogDescription>
              This will permanently delete {dialog?.type === "delete" ? dialog.userName : ""} and
              all their data. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog} disabled={submitting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirm} disabled={submitting}>
              {submitting ? "Deleting…" : "Delete user"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
