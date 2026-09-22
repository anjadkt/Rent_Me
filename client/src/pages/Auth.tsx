import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { sendOtp, verifyOtp } from "../services/auth.service";

type AuthStep = "email" | "otp";

export default function Auth() {
  const navigate = useNavigate();

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
  const [message, setMessage] = useState("");

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
      setMessage("");

      await sendOtp({ name: name.trim(), email: email.trim() });

      setStep("otp");
      setMessage("Verification code sent");
    } catch (error: any) {
      setMessage(error?.response?.data?.message || "Failed to send code");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!validateOtp()) return;

    try {
      setLoading(true);
      setMessage("");

      await verifyOtp({ email: email.trim(), otp });

      navigate("/");
    } catch (error: any) {
      setMessage(error?.response?.data?.message || "Invalid verification code");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`;
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 font-sans antialiased">
      <div className="w-full max-w-4xl bg-white rounded-2xl border border-slate-200/80 shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        
      {/* LEFT BRAND PANEL - Hidden on Mobile */}
<div className="hidden lg:flex lg:col-span-5 relative p-8 flex-col justify-between overflow-hidden bg-slate-900">
  {/* Background Image with Dark Overlay */}
  <div 
    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 hover:scale-105"
    style={{
      backgroundImage: `url('https://images.unsplash.com/photo-1617814076367-b759c7d7e738?q=80&w=1000&auto=format&fit=crop')`
    }}
  />
  {/* Gradient overlays for readability */}
  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-slate-950/40" />

  {/* Logo */}
  <div className="relative z-10 flex items-center gap-2.5">
    <div className="w-8 h-8 rounded-lg bg-emerald-500/90 backdrop-blur flex items-center justify-center shadow-md shadow-emerald-500/20">
      <span className="text-white font-bold text-sm tracking-wider">R</span>
    </div>
    <span className="text-lg font-bold tracking-tight text-white">
      Rent<span className="text-emerald-400">Ride</span>
    </span>
  </div>

  {/* Bottom Overlay Title & Badge */}
  <div className="relative z-10 mt-auto pt-12">
    <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/20 backdrop-blur-md border border-emerald-400/30 text-emerald-300 text-[11px] font-semibold tracking-wider uppercase mb-3">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
      Premium Fleet
    </div>
    <h2 className="text-2xl font-bold text-white tracking-tight leading-snug">
      Drive on Your Terms
    </h2>
  </div>
</div>

        {/* RIGHT FORM PANEL - Always visible */}
        <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-center bg-white">
          <div className="w-full max-w-sm mx-auto">

            {/* FORM HEADER TEXT */}
            <div className="mb-6">
              <div className="flex items-center gap-2 lg:hidden mb-4">
                <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center">
                  <span className="text-white font-bold text-xs">R</span>
                </div>
                <span className="text-base font-bold text-slate-900">
                  Rent<span className="text-emerald-600">Ride</span>
                </span>
              </div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                {step === "email" ? "Sign in or create account" : "Verify code"}
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                {step === "email"
                  ? "Enter your details to manage bookings and rentals."
                  : `Enter the 6-digit verification code sent to ${email}`}
              </p>
            </div>

            {step === "email" ? (
              <>
                <div className="space-y-3.5 mb-5">
                  {/* Name Input */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
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
                      className={`w-full px-3.5 py-2.5 rounded-lg text-sm text-slate-900 bg-slate-50 border outline-none transition focus:bg-white focus:ring-2 ${
                        errors.name
                          ? "border-red-400 focus:ring-red-100"
                          : "border-slate-200 focus:border-emerald-600 focus:ring-emerald-500/10"
                      }`}
                    />
                    {errors.name && (
                      <p className="mt-1 text-xs text-red-500">{errors.name}</p>
                    )}
                  </div>

                  {/* Email Input */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
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
                      className={`w-full px-3.5 py-2.5 rounded-lg text-sm text-slate-900 bg-slate-50 border outline-none transition focus:bg-white focus:ring-2 ${
                        errors.email
                          ? "border-red-400 focus:ring-red-100"
                          : "border-slate-200 focus:border-emerald-600 focus:ring-emerald-500/10"
                      }`}
                    />
                    {errors.email && (
                      <p className="mt-1 text-xs text-red-500">{errors.email}</p>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={loading}
                  className="w-full py-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm transition shadow-md shadow-emerald-600/15 disabled:opacity-50"
                >
                  {loading ? "Sending..." : "Continue"}
                </button>
              </>
            ) : (
              <>
                <div className="mb-4">
                  <button
                    type="button"
                    onClick={() => {
                      setStep("email");
                      setOtp("");
                      setErrors({});
                      setMessage("");
                    }}
                    className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 hover:text-emerald-700 transition"
                  >
                    ← Change Email
                  </button>
                </div>

                <div className="mb-5">
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
                    className={`w-full px-3 py-3 text-center text-xl tracking-[0.5em] font-mono rounded-lg bg-slate-50 border text-slate-900 placeholder-slate-300 outline-none transition focus:bg-white focus:ring-2 ${
                      errors.otp
                        ? "border-red-400 focus:ring-red-100"
                        : "border-slate-200 focus:border-emerald-600 focus:ring-emerald-500/10"
                    }`}
                  />
                  {errors.otp && (
                    <p className="mt-1 text-xs text-red-500 text-center">{errors.otp}</p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleVerifyOtp}
                  disabled={loading || otp.length !== 6}
                  className="w-full py-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm transition shadow-md shadow-emerald-600/15 disabled:opacity-50"
                >
                  {loading ? "Verifying..." : "Verify & Continue"}
                </button>

                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={loading}
                  className="w-full mt-2.5 py-1.5 text-xs font-medium text-slate-500 hover:text-emerald-600 transition"
                >
                  Resend OTP
                </button>
              </>
            )}

            {/* Notification / Error message */}
            {message && (
              <p className="mt-3 text-center text-xs font-medium text-emerald-700">
                {message}
              </p>
            )}

            {/* Divider */}
            <div className="flex items-center gap-3 my-5">
              <div className="h-px flex-1 bg-slate-200" />
              <span className="text-[11px] font-semibold tracking-wider uppercase text-slate-400">
                or
              </span>
              <div className="h-px flex-1 bg-slate-200" />
            </div>

            {/* Google OAuth Button */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-2.5 py-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 transition text-sm font-medium text-slate-700"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
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
              Continue with Google
            </button>

          </div>
        </div>

      </div>
    </div>
  );
}