"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  getAuthInstance,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { LogIn, Globe, ArrowRight, Sparkles } from "lucide-react";

function mapAuthError(err: any): string {
  const code = err?.code || "";
  switch (code) {
    case "auth/invalid-email": return "Invalid email format";
    case "auth/user-not-found": return "No account found for this email";
    case "auth/wrong-password": return "Password incorrect";
    case "auth/weak-password": return "Password is too weak";
    case "auth/email-already-in-use": return "Email already in use";
    case "auth/network-request-failed": return "Network error, try again";
    case "auth/too-many-requests": return "Too many attempts, please wait";
    case "auth/invalid-credential":
      return "Sign-in credential expired or invalid";
    case "auth/popup-closed-by-user": return "Sign-in was cancelled";
    case "auth/popup-blocked": return "Popup blocked, allow popups";
    default:
      return err?.message || "Something went wrong";
  }
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function handleEmailSignIn(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(getAuthInstance(), email, password);
      router.replace("/");
    } catch (err: any) {
      toast.error(mapAuthError(err));
    } finally {
      setIsLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    setIsLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      await signInWithPopup(getAuthInstance(), provider);
      router.replace("/");
    } catch (err: any) {
      if (err?.code === "auth/popup-blocked" || err?.code === "auth/popup-closed-by-user") {
        // Try redirect
      } else {
        toast.error(mapAuthError(err));
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-svh items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-sm"
      >
        <div className="glass-strong rounded-3xl p-6 shadow-2xl shadow-primary/5 sm:p-8">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="mb-8 flex items-center justify-center"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/20">
              <Sparkles className="h-7 w-7 text-primary" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.5 }}
            className="mb-8 text-center"
          >
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Welcome back
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Sign in to continue tracking your habits
            </p>
          </motion.div>

          <motion.form
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.5 }}
            onSubmit={handleEmailSignIn}
            className="space-y-5"
          >
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11 rounded-xl border-border/60 bg-background/50 transition-all focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-11 rounded-xl border-border/60 bg-background/50 transition-all focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="h-11 w-full gap-2 rounded-xl text-sm font-semibold shadow-lg shadow-primary/20 transition-all hover:shadow-primary/30 active:scale-[0.98]"
            >
              {isLoading ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
              ) : (
                <>
                  <LogIn className="h-4 w-4" />
                  Sign in
                </>
              )}
            </Button>
          </motion.form>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="my-6 flex items-center gap-3"
          >
            <span className="h-px flex-1 bg-border/60" />
            <span className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
              Or
            </span>
            <span className="h-px flex-1 bg-border/60" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.5 }}
          >
            <Button
              variant="outline"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="h-11 w-full gap-2 rounded-xl border-border/60 bg-background/40 text-sm font-medium transition-all hover:bg-background/60 active:scale-[0.98]"
            >
            <Globe className="h-4 w-4" />
            Continue with Google
            </Button>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.65 }}
            className="mt-6 text-center text-sm text-muted-foreground"
          >
            New here?{" "}
            <Link
              href="/register"
              className="group inline-flex items-center gap-0.5 font-medium text-primary transition-colors hover:text-primary/80"
            >
              Create Account
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
}
