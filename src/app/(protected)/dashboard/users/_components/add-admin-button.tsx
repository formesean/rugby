"use client";

import { ShieldCheck, UserPlus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePromoteByEmail } from "@/hooks/use-users";

export function AddAdminButton() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const promote = usePromoteByEmail();

  async function handleSubmit() {
    if (!email.trim()) return;
    try {
      await promote.mutateAsync(email.trim());
      setOpen(false);
      setEmail("");
    } catch {
      // error displayed via promote.error
    }
  }

  return (
    <>
      <Button
        className="shrink-0 gap-1.5"
        onClick={() => {
          promote.reset();
          setEmail("");
          setOpen(true);
        }}
      >
        <UserPlus className="size-4" />
        Add Admin
      </Button>

      <Dialog
        open={open}
        onOpenChange={(v) => {
          if (!v) setOpen(false);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldCheck className="size-4" />
              Grant admin access
            </DialogTitle>
            <DialogDescription>
              Enter the email address of an existing user to grant them admin access.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2 py-2">
            <Label htmlFor="admin-email">Email address</Label>
            <Input
              id="admin-email"
              type="email"
              autoComplete="email"
              placeholder="user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && email.trim()) handleSubmit();
              }}
            />
            {promote.error && <p className="text-xs text-destructive">{promote.error.message}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={promote.isPending}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={promote.isPending || !email.trim()}>
              {promote.isPending ? "Granting…" : "Grant access"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
