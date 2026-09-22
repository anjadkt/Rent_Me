import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { sendOtp, verifyOtp } from "../../services/auth.service";
import { useAuth } from "../../hooks/useAuth";

type AuthStep = "email" | "otp";

export default function AuthForm() {
  const navigate = useNavigate();

  const { login } = useAuth();

  const [step, setStep] = useState<AuthStep>("email");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");

  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    otp?: string;
  }>({});

  const [loading, setLoading] = useState(false);

  const validateEmailForm = () => {
    const newErrors: { name?: string; email?: string } = {};

    if (!name.trim()) {
      newErrors.name = "Name required";
    } else if (name.trim().length < 2) {
      newErrors.name = "Minimum 2 characters";
    }

    if (!email.trim()) {
      newErrors.email = "Email required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Invalid email address";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateOtp = () => {
    const newErrors: { otp?: string } = {};

    if (!otp) {
      newErrors.otp = "OTP required";
    } else if (!/^\d{6}$/.test(otp)) {
      newErrors.otp = "6-digit code required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSendOtp = async () => {
    if (!validateEmailForm()) return;

    try {
      setLoading(true);

      await sendOtp({ name: name.trim(), email: email.trim() });

      setStep("otp");
      toast.success("Verification code sent");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to send code");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!validateOtp()) return;

    try {
      setLoading(true);

      const res = await verifyOtp({ email: email.trim(), otp });
      login(res.data);

      toast.success("Login successful!");
      navigate("/");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Invalid verification code");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`;
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* FORM HEADER TEXT */}
      <div className="mb-8">
        <div className="flex items-center gap-2 lg:hidden mb-6">
          <span className="text-2xl font-extrabold tracking-tight text-slate-900">
            Rent<span className="text-amber-500">Ride</span>
          </span>
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          {step === "email" ? "Sign in or create account" : "Verify code"}
        </h1>
        <p className="text-sm font-medium text-slate-500 mt-1.5">
          {step === "email"
            ? "Enter your details to manage bookings and rentals."
            : `Enter the 6-digit verification code sent to ${email}`}
        </p>
      </div>

      {step === "email" ? (
        <div className="space-y-5">
          <div className="space-y-4">
            {/* Name Input */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
                }}
                placeholder="e.g. Alex Mercer"
                className={`w-full px-4 py-3 rounded-2xl text-sm font-medium text-slate-900 bg-slate-50 border outline-none transition-all focus:bg-white focus:ring-4 ${
                  errors.name
                    ? "border-red-400 focus:ring-red-100"
                    : "border-slate-200 focus:border-amber-400 focus:ring-amber-100"
                }`}
              />
              {errors.name && (
                <p className="mt-1.5 text-xs font-semibold text-red-500">{errors.name}</p>
              )}
            </div>

            {/* Email Input */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                }}
                placeholder="alex@example.com"
                className={`w-full px-4 py-3 rounded-2xl text-sm font-medium text-slate-900 bg-slate-50 border outline-none transition-all focus:bg-white focus:ring-4 ${
                  errors.email
                    ? "border-red-400 focus:ring-red-100"
                    : "border-slate-200 focus:border-amber-400 focus:ring-amber-100"
                }`}
              />
              {errors.email && (
                <p className="mt-1.5 text-xs font-semibold text-red-500">{errors.email}</p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={handleSendOtp}
            disabled={loading}
            className="w-full py-3.5 mt-2 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:hover:translate-y-0"
          >
            {loading ? "Sending..." : "Continue with Email"}
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="mb-2">
            <button
              type="button"
              onClick={() => {
                setStep("email");
                setOtp("");
                setErrors({});
              }}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 hover:text-amber-700 transition"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              Change Email
            </button>
          </div>

          <div>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={otp}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                setOtp(value);
                if (errors.otp) setErrors((prev) => ({ ...prev, otp: undefined }));
              }}
              placeholder="••••••"
              className={`w-full px-4 py-4 text-center text-2xl tracking-[0.5em] font-mono font-bold rounded-2xl bg-slate-50 border text-slate-900 placeholder-slate-300 outline-none transition-all focus:bg-white focus:ring-4 ${
                errors.otp
                  ? "border-red-400 focus:ring-red-100"
                  : "border-slate-200 focus:border-amber-400 focus:ring-amber-100"
              }`}
            />
            {errors.otp && (
              <p className="mt-2 text-xs font-semibold text-red-500 text-center">{errors.otp}</p>
            )}
          </div>

          <button
            type="button"
            onClick={handleVerifyOtp}
            disabled={loading || otp.length !== 6}
            className="w-full py-3.5 mt-2 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:hover:translate-y-0"
          >
            {loading ? "Verifying..." : "Verify & Continue"}
          </button>

          <button
            type="button"
            onClick={handleSendOtp}
            disabled={loading}
            className="w-full py-2 text-xs font-bold text-slate-500 hover:text-amber-600 transition"
          >
            Resend Code
          </button>
        </div>
      )}

      {/* Divider */}
      <div className="flex items-center gap-4 my-8">
        <div className="h-px flex-1 bg-slate-200" />
        <span className="text-[10px] font-extrabold tracking-widest uppercase text-slate-400">
          OR CONTINUE WITH
        </span>
        <div className="h-px flex-1 bg-slate-200" />
      </div>

      {/* Google OAuth Button */}
      <button
        type="button"
        onClick={handleGoogleLogin}
        className="w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl border-2 border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 transition-all text-sm font-bold text-slate-700 shadow-sm"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path
            fill="#EA4335"
            d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z"
          />
          <path
            fill="#4285F4"
            d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
          />
          <path
            fill="#FBBC05"
            d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15s.7 5.3 1.9 7.7l3.7-2.9z"
          />
          <path
            fill="#34A853"
            d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.2L1.9 16c1.8 3.7 5.6 7 10.1 7z"
          />
        </svg>
        Google
      </button>
    </div>
  );
}
