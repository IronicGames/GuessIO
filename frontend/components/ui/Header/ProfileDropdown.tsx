import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Button from '../Button';
import { useAuth } from '@/app/providers/auth-provider';

export const ProfileDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="fixed top-0 right-10 z-50">
      {/* Avatar / trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 hover:brightness-150 transition-all"
      >
        {user?.profilePicture ? (
          <Image
            src={user?.profilePicture}
            alt="Profile Picture"
            width={36}
            height={36}
            className="rounded-full object-cover"
          />
        ) : (
          <div className="w-9 h-9 rounded-full bg-violet-500/30 flex items-center justify-center text-white font-semibold">
            {user?.name[0].toUpperCase()}
          </div>
        )}
        <span className="text-white text-3xl font-semibold">{user?.name}</span>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-30 bg-white/5 border border-white/10 rounded-xl shadow-lg overflow-hidden z-50">
          <Button
            onClick={() => {
              /*Handle profile*/
            }}
            className="w-full h-10 px-4 py-3 rounded-b-none text-sm text-white hover:bg-white/10 transition-all"
          >
            Profile
          </Button>
          <Button
            onClick={() => {
              /*Handle Settings*/
            }}
            className="w-full h-10 px-4 py-3 rounded-none text-sm text-white hover:bg-white/10 transition-all"
          >
            Settings
          </Button>
          <hr className="border-white/10 w-4" />
          <Button
            variant="red"
            onClick={useAuth().logout}
            className="w-full h-10 px-4 py-3 rounded-t-none text-sm text-red-400 hover:bg-white/10 transition-all"
          >
            Logout
          </Button>
        </div>
      )}
    </div>
  );
};
