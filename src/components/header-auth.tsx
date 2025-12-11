"use client";

import { useState, useEffect, startTransition } from "react";
import { SignIn, SignUp, useUser } from "@clerk/nextjs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export function HeaderAuth() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const { isSignedIn } = useUser();
  const router = useRouter();

  // Close modal and redirect when user successfully signs in
  useEffect(() => {
    if (isSignedIn && open) {
      startTransition(() => {
        setOpen(false);
        router.push("/dashboard");
      });
    }
  }, [isSignedIn, open, router]);

  return (
    <>
      <div className="flex gap-4">
        <Button
          onClick={() => {
            setMode("signin");
            setOpen(true);
          }}
        >
          Sign In
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            setMode("signup");
            setOpen(true);
          }}
        >
          Sign Up
        </Button>
      </div>

      <Dialog
        open={open}
        onOpenChange={(isOpen) => {
          setOpen(isOpen);
          if (!isOpen) {
            // Reset to sign-in mode when modal closes
            setMode("signin");
          }
        }}
      >
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {mode === "signin" ? "Sign In" : "Create Account"}
            </DialogTitle>
            <DialogDescription>
              {mode === "signin"
                ? "Sign in to your account to continue"
                : "Create a new account to get started"}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center py-4">
            {mode === "signin" ? (
              <SignIn
                routing="hash"
                appearance={{
                  elements: {
                    rootBox: "mx-auto w-full",
                    card: "shadow-none",
                  },
                }}
                afterSignInUrl="/dashboard"
              />
            ) : (
              <SignUp
                routing="hash"
                appearance={{
                  elements: {
                    rootBox: "mx-auto w-full",
                    card: "shadow-none",
                  },
                }}
                afterSignUpUrl="/dashboard"
              />
            )}
          </div>
          <div className="flex justify-center gap-2 pt-2 border-t">
            <Button
              variant="ghost"
              className="text-sm"
              onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            >
              {mode === "signin"
                ? "Don't have an account? Sign up"
                : "Already have an account? Sign in"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

