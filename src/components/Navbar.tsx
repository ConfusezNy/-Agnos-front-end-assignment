'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavbarProps {
  connectionState?: 'connecting' | 'connected' | 'disconnected';
}

export default function Navbar({ connectionState }: NavbarProps) {
  const pathname = usePathname();

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/patient', label: 'Patient Form' },
    { href: '/staff', label: 'Staff View' },
  ];

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white/90 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="text-[15px] font-semibold tracking-tight text-[#001a33]">
          AgnosHealth
        </Link>

        <div className="flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-lg px-3 py-1.5 text-sm transition-colors duration-200 ${
                pathname === link.href
                  ? 'bg-gray-100 font-medium text-[#001a33]'
                  : 'text-[#63707c] hover:text-[#001a33]'
              }`}
            >
              {link.label}
            </Link>
          ))}

          {connectionState && (
            <div className="ml-4 flex items-center gap-1.5">
              <div
                className={`h-2 w-2 rounded-full ${
                  connectionState === 'connected'
                    ? 'bg-emerald-500'
                    : connectionState === 'connecting'
                      ? 'animate-pulse bg-amber-400'
                      : 'bg-gray-300'
                }`}
              />
              <span className="text-xs text-[#63707c]">
                {connectionState === 'connected'
                  ? 'Connected'
                  : connectionState === 'connecting'
                    ? 'Connecting'
                    : 'Offline'}
              </span>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
