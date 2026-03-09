import { useEffect, useState } from 'react';
import '../../../styles/globals.css';
import Button from '../Button';
import TextButton from '../TextButton';
import Image from 'next/image';
export default function Login() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  // const [scrolled, setScrolled] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // useEffect(() => {
  //   const onScroll = () => setScrolled(window.scrollY > 20);
  //   window.addEventListener('scroll', onScroll);
  //   return () => window.removeEventListener('scroll', onScroll);
  // }, []);

  useEffect(() => {
    if (isModalOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isModalOpen]);

  const handleLoginModal = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsModalOpen(false);
    }, 1500);
  };

  const handleLogin = () => {
    window.location.href = 'http://localhost:8080/api/auth/google';
  };

  return (
    <main
      style={{
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <TextButton
        className="fixed top-0 right-10"
        onClick={() => setIsModalOpen(true)}
      >
        Login
      </TextButton>

      {/* Modal Overlay */}
      {isModalOpen && (
        <div
          onClick={() => setIsModalOpen(false)}
          className="fixed inset-0 z-200 bg-black/70 backdrop-blur-sm flex items-center justify-center p-6"
        >
          {/* Modal Box */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="card border border-white/10 rounded-2xl p-10 w-full max-w-sm shadow-2xl"
          >
            <div className="text-center mb-8">
              <div className="text-2xl font-extrabold tracking-tight mb-1">
                GuessIO
              </div>
              <p className="text-gray-500 text-sm">Sign in to your account</p>
            </div>
            <div>
              <Button
                className="w-full h-10 flex gap-2 py-3 bg-red-300 transition-all text-xl"
                onClick={handleLogin}
              >
                <Image
                  src="/assets/google-logo.svg"
                  alt="Google"
                  width={20}
                  height={20}
                />
                Sign in with Google
              </Button>
            </div>
            <div className="flex items-center gap-4 w-full my-2">
              <hr className="flex-1 border-white/10" />
              <span className="text-white text-sm">or</span>
              <hr className="flex-1 border-white/10" />
            </div>
            <div className="mb-4">
              <label className="block text-xs font-semibold text-white uppercase tracking-widest mb-2">
                Email
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 focus: focus:bg-violet-500/5 rounded-xl px-4 py-3 
                text-sm text-white placeholder-gray-600 outline-none transition-all"
              />
            </div>
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-semibold text-white uppercase tracking-widest">
                  Password
                </label>
                <a
                  href="#"
                  className="text-xs text-blue hover:opacity-70 transition-colors"
                >
                  Forgot?
                </a>
              </div>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 focus:border-violet-500/60 focus:bg-violet-500/5 rounded-xl px-4 py-3 
                text-sm text-white placeholder-gray-600 outline-none transition-all"
              />
            </div>

            {/* Submit */}
            <Button
              onClick={handleLoginModal}
              className="w-full h-10 flex gap-2 py-3 transition-all text-xl"
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8H4z"
                    />
                  </svg>
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </Button>
            <p className="text-center mt-5 text-sm text-gray-600">
              Don't have an account?{' '}
              <a
                href="#"
                className="text-xs text-blue hover:opacity-70 transition-colors"
              >
                Sign up free
              </a>
            </p>
          </div>
          <p className="fixed bottom-8 left-1/2 -translate-x-1/2 text-xs text-gray-700">
            Click outside to close
          </p>
        </div>
      )}
    </main>
  );
}
