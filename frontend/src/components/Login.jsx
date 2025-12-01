import React, { useState, useEffect } from "react";
import {
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPhoneNumber,
  RecaptchaVerifier,
  signInAnonymously,
} from "firebase/auth";
import { auth } from "../firebaseConfig";
import { LogIn, Mail, Phone, ArrowLeft, UserX } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Phone auth states
  const [authMode, setAuthMode] = useState("default"); // "default" | "phone" | "otp"
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [confirmationResult, setConfirmationResult] = useState(null);

  // Initialize ReCAPTCHA verifier
  useEffect(() => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(
        auth,
        "recaptcha-container",
        {
          size: "invisible",
          callback: () => {
            // reCAPTCHA solved
          },
          "expired-callback": () => {
            setError("ReCAPTCHA expired. Please try again.");
          },
        }
      );
    }

    return () => {
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
    };
  }, []);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError("");
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err) {
      setError(err.message);
      console.error("Google sign-in error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      console.error("Email auth error:", err);

      // Provide user-friendly error messages
      if (err.code === "auth/operation-not-allowed") {
        setError(
          "Email/Password authentication is not enabled. Please enable it in Firebase Console: Authentication > Sign-in method > Email/Password"
        );
      } else if (err.code === "auth/weak-password") {
        setError("Password is too weak. Please use at least 6 characters.");
      } else if (err.code === "auth/email-already-in-use") {
        setError("This email is already registered. Please sign in instead.");
      } else if (err.code === "auth/invalid-email") {
        setError("Invalid email address.");
      } else if (err.code === "auth/user-not-found") {
        setError("No account found with this email. Please sign up first.");
      } else if (err.code === "auth/wrong-password") {
        setError("Incorrect password.");
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGuestSignIn = async () => {
    setLoading(true);
    setError("");
    try {
      await signInAnonymously(auth);
    } catch (err) {
      setError(err.message);
      console.error("Guest sign-in error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const appVerifier = window.recaptchaVerifier;
      const confirmation = await signInWithPhoneNumber(
        auth,
        phoneNumber,
        appVerifier
      );
      setConfirmationResult(confirmation);
      setAuthMode("otp");
      setError("");
    } catch (err) {
      console.error("Phone auth error:", err);
      if (err.code === "auth/invalid-phone-number") {
        setError("Invalid phone number format. Use +1 234 567 8900");
      } else if (err.code === "auth/too-many-requests") {
        setError("Too many requests. Please try again later.");
      } else if (err.code === "auth/operation-not-allowed") {
        setError(
          "Phone authentication is not enabled. Please enable it in Firebase Console."
        );
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await confirmationResult.confirm(otp);
      // User is now signed in
    } catch (err) {
      console.error("OTP verification error:", err);
      if (err.code === "auth/invalid-verification-code") {
        setError("Invalid OTP code. Please check and try again.");
      } else if (err.code === "auth/code-expired") {
        setError("OTP code expired. Please request a new code.");
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const resetToDefault = () => {
    setAuthMode("default");
    setPhoneNumber("");
    setOtp("");
    setError("");
    setConfirmationResult(null);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="glass rounded-2xl p-8 animate-fade-in">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-darkZinc mb-4">
              <LogIn className="w-8 h-8 text-primaryWhite" />
            </div>
            <h1 className="text-3xl font-bold mb-2">
              {isSignUp ? "Create an Account" : "Welcome Back"}
            </h1>
            <p className="text-mutedGrey">
              {isSignUp
                ? "Join Echo and start your journey"
                : "Where your thoughts echo through intelligence"}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/50 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Default Mode - Google, Phone, Email */}
          {authMode === "default" && (
            <>
              {/* Google Sign-In */}
              <button
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-primaryWhite text-richBlack rounded-xl font-medium hover:bg-opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed mb-4"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                {loading ? "Signing in..." : "Continue with Google"}
              </button>

              {/* Phone Sign-In - Requires Blaze Plan */}
              {/* Uncomment when Firebase Blaze plan is enabled */}
              {/* <button
                onClick={() => setAuthMode("phone")}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-primaryWhite text-richBlack rounded-xl font-medium hover:bg-opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed mb-6"
              >
                <Phone className="w-5 h-5" />
                Continue with Phone
              </button> */}

              {/* Divider */}
              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-subtleGrey"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-darkZinc text-mutedGrey">or</span>
                </div>
              </div>

              {/* Email/Password Form */}
              <form onSubmit={handleEmailAuth} className="space-y-4">
                <div>
                  <label className="block text-sm text-mutedGrey mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-mutedGrey" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      required
                      disabled={loading}
                      className="w-full pl-11 pr-4 py-3 bg-darkZinc border border-subtleGrey rounded-xl text-primaryWhite placeholder-mutedGrey focus:outline-none focus:ring-2 focus:ring-primaryWhite/20 transition-all disabled:opacity-50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-mutedGrey mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    disabled={loading}
                    className="w-full px-4 py-3 bg-darkZinc border border-subtleGrey rounded-xl text-primaryWhite placeholder-mutedGrey focus:outline-none focus:ring-2 focus:ring-primaryWhite/20 transition-all disabled:opacity-50"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-6 py-3 bg-darkZinc border border-subtleGrey rounded-xl text-primaryWhite font-medium hover:bg-subtleGrey transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading
                    ? "Processing..."
                    : isSignUp
                    ? "Create Account"
                    : "Sign In"}
                </button>
              </form>

              {/* Toggle Sign Up/Sign In */}
              <button
                onClick={() => setIsSignUp(!isSignUp)}
                className="w-full mt-4 text-center text-sm text-mutedGrey hover:text-primaryWhite transition-colors"
              >
                {isSignUp
                  ? "Already have an account? Log in"
                  : "Don't have an account? Sign up"}
              </button>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-subtleGrey"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-2 bg-darkZinc text-mutedGrey">or</span>
                </div>
              </div>

              {/* Guest Mode Button */}
              <button
                onClick={handleGuestSignIn}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-transparent border border-white/20 text-white/70 rounded-xl text-sm font-medium hover:bg-white/10 hover:text-white hover:border-white/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <UserX className="w-4 h-4" />
                Continue as Guest
              </button>
            </>
          )}

          {/* Phone Mode - Enter Phone Number */}
          {authMode === "phone" && (
            <>
              <button
                onClick={resetToDefault}
                className="flex items-center gap-2 text-sm text-mutedGrey hover:text-primaryWhite transition-colors mb-6"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>

              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-teal-600 to-teal-700 mb-4 shadow-lg shadow-teal-500/30">
                  <Phone className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Phone Login</h2>
                <p className="text-mutedGrey text-sm">
                  We'll send you a verification code
                </p>
              </div>

              <form onSubmit={handlePhoneAuth} className="space-y-4">
                <div>
                  <label className="block text-sm text-mutedGrey mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-mutedGrey" />
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="+1 234 567 8900"
                      required
                      disabled={loading}
                      className="w-full pl-11 pr-4 py-3 bg-darkZinc border border-subtleGrey rounded-xl text-primaryWhite placeholder-mutedGrey focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all disabled:opacity-50"
                    />
                  </div>
                  <p className="text-xs text-mutedGrey mt-2">
                    Include country code (e.g., +1 for US)
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-6 py-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-xl font-medium hover:from-teal-600 hover:to-teal-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-teal-500/20"
                >
                  {loading ? "Sending Code..." : "Send Code"}
                </button>
              </form>
            </>
          )}

          {/* OTP Mode - Verify Code */}
          {authMode === "otp" && (
            <>
              <button
                onClick={resetToDefault}
                className="flex items-center gap-2 text-sm text-mutedGrey hover:text-primaryWhite transition-colors mb-6"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>

              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-teal-600 to-teal-700 mb-4 shadow-lg shadow-teal-500/30">
                  <Phone className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Enter Code</h2>
                <p className="text-mutedGrey text-sm">
                  Enter the 6-digit code sent to
                  <br />
                  <span className="text-teal-400">{phoneNumber}</span>
                </p>
              </div>

              <form onSubmit={handleOtpVerify} className="space-y-4">
                <div>
                  <label className="block text-sm text-mutedGrey mb-2">
                    Verification Code
                  </label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="123456"
                    required
                    maxLength={6}
                    disabled={loading}
                    className="w-full px-4 py-3 bg-darkZinc border border-subtleGrey rounded-xl text-primaryWhite placeholder-mutedGrey text-center text-2xl tracking-widest focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all disabled:opacity-50"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="w-full px-6 py-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-xl font-medium hover:from-teal-600 hover:to-teal-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-teal-500/20"
                >
                  {loading ? "Verifying..." : "Verify & Login"}
                </button>

                <button
                  type="button"
                  onClick={() => setAuthMode("phone")}
                  className="w-full text-center text-sm text-teal-400 hover:text-teal-300 transition-colors"
                >
                  Didn't receive code? Resend
                </button>
              </form>
            </>
          )}

          {/* Hidden ReCAPTCHA container */}
          <div id="recaptcha-container"></div>
        </div>

        {/* Footer */}
        <p className="text-center text-mutedGrey text-sm mt-6">
          By signing in, you agree to our Terms and Privacy Policy
        </p>
      </div>
    </div>
  );
}
