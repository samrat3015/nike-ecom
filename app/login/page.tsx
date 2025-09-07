"use client";

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { userLogin, fetchUser } from "@/store/slices/authSlice"; // Adjust path if needed
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import Link from "next/link";
import { RootState, AppDispatch } from "@/store"; // Import typed RootState and AppDispatch

export default function Login() {
  const dispatch = useDispatch<AppDispatch>(); // Use typed AppDispatch
  const router = useRouter();
  const { loading, error } = useSelector((state: RootState) => state.auth); // Use RootState

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mounted, setMounted] = useState(false); // Track client mount

  // Only render on client to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Remove unwanted extension attributes
  useEffect(() => {
    if (!mounted) return;

    const removeAttributes = () => {
      const elements = document.querySelectorAll(
        "[jf-ext-cache-id], [jf-ext-button-ct]"
      );
      elements.forEach((el) => {
        el.removeAttribute("jf-ext-cache-id");
        el.removeAttribute("jf-ext-button-ct");
      });
    };

    removeAttributes(); // run immediately

    const observer = new MutationObserver(removeAttributes);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, [mounted]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Dispatch login action
      await dispatch(userLogin({ email, password })).unwrap();
      router.push("/dashboard");
    } catch (err: any) {
      console.error("Login failed:", err);
      toast.error(err.message || "Login failed");
    }
  };

  if (!mounted) return null; // SSR-safe: render nothing until client mounts

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleLogin}
        className="bg-white p-8 rounded-lg shadow-md w-full max-w-md"
      >
        <h1 className="text-2xl font-bold mb-6 text-center">Login</h1>
        {error && <p className="text-red-500 mb-4 text-center">{error}</p>}

        <label className="block mb-2 font-medium text-gray-700">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          className="w-full p-3 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />

        <label className="block mb-2 font-medium text-gray-700">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          className="w-full p-3 mb-6 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className={`w-full p-3 text-white rounded-lg font-semibold ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="text-blue-600 hover:text-blue-500"
            >
              Register here
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}