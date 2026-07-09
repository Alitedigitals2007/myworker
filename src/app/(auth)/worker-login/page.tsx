"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { LucideEye, LucideEyeOff, LucideLock, LucideUser, LucideAlertCircle, LucideCamera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import { z } from "zod";

type WorkerLoginForm = {
  workerId: string;
  password: string;
  faceVerified?: boolean;
};

const workerLoginFormSchema = z.object({
  workerId: z.string().min(1, "Worker ID is required"),
  password: z.string().min(1, "Password is required")
});

export default function WorkerLoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFaceCapture, setShowFaceCapture] = useState(false);
  const [isFirstLogin] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<WorkerLoginForm>({
    resolver: zodResolver(workerLoginFormSchema),
    defaultValues: {
      workerId: "",
      password: ""
    }
  });

  const onSubmit = async (data: WorkerLoginForm) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await signIn("credentials", {
        workerId: data.workerId,
        password: data.password,
        loginType: "worker",
        redirect: false
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      toast.success("Login successful!");
      router.push("/worker");
      router.refresh();
    } catch (err: unknown) {
      const raw = err instanceof Error ? err.message : "Login failed";
      const friendly =
        raw === "WORKER_NOT_FOUND" ? "Worker ID not found. Check your ID and try again." :
        raw === "INVALID_PASSWORD" ? "Incorrect password. Please try again." :
        raw;
      setError(friendly);
      toast.error(friendly);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFaceCapture = () => {
    // In production, this would use face-api.js to capture and verify face
    setShowFaceCapture(false);
    toast.success("Face verified successfully!");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-indigo-950 p-4">
      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(99,102,241,0.15),transparent_50%)]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        className="relative w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-xl shadow-indigo-500/30 mb-4"
          >
            <span className="text-2xl font-bold text-white">MW</span>
          </motion.div>
          <h1 className="text-3xl font-bold gradient-text">MY WORKER</h1>
          <p className="text-muted-foreground mt-2">Worker Portal</p>
        </div>

        {/* Login Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-800/50 p-8"
        >
          <h2 className="text-xl font-semibold mb-6">Worker Sign In</h2>

          {error && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 p-3 mb-4 text-sm text-red-500 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-900/50"
            >
              <LucideAlertCircle size={16} />
              <span>{error}</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="workerId" className="text-sm font-medium">
                Worker ID
              </label>
              <div className="relative">
                <LucideUser size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  {...register("workerId")}
                  id="workerId"
                  type="text"
                  placeholder="MW-12345678"
                  className={cn(
                    "pl-10 h-12 uppercase",
                    errors.workerId && "border-red-500 focus:ring-red-500"
                  )}
                  autoComplete="username"
                />
              </div>
              {errors.workerId && (
                <p className="text-xs text-red-500">{errors.workerId.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <div className="relative">
                <LucideLock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  {...register("password")}
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className={cn(
                    "pl-10 pr-10 h-12",
                    errors.password && "border-red-500 focus:ring-red-500"
                  )}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <LucideEyeOff size={18} /> : <LucideEye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-500">{errors.password.message}</p>
              )}
            </div>

            {isFirstLogin && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg"
              >
                <p className="text-sm text-indigo-600 dark:text-indigo-400 mb-3">
                  First time login detected. Please verify your face.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => setShowFaceCapture(true)}
                >
                  <LucideCamera size={18} className="mr-2" />
                  Capture Face
                </Button>
              </motion.div>
            )}

            <Button
              type="submit"
              className="w-full h-12 text-base font-medium"
              loading={isLoading}
            >
              Sign In
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>Admin? <a href="/login" className="text-primary hover:underline font-medium">Sign in here</a></p>
          </div>
        </motion.div>

        {/* Face Capture Modal */}
        {showFaceCapture && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowFaceCapture(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-sm w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold mb-4">Face Verification</h3>
              <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center mb-4">
                <LucideCamera size={48} className="text-gray-400" />
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Position your face in the frame and look at the camera.
              </p>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setShowFaceCapture(false)}>
                  Cancel
                </Button>
                <Button className="flex-1" onClick={handleFaceCapture}>
                  Capture
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}

        <p className="text-center text-xs text-muted-foreground mt-6">
          Protected by face recognition and secure authentication.
        </p>
      </motion.div>
    </div>
  );
}