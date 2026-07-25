import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex h-14 max-w-5xl items-center px-6">
          <span className="text-[15px] font-semibold tracking-tight text-[#001a33]">
            AgnosHealth
          </span>
        </div>
      </header>

      {/* Content */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-16">
        <h1 className="text-center text-2xl font-semibold tracking-tight text-[#001a33] sm:text-3xl">
          Patient Intake System
        </h1>
        <p className="mt-3 max-w-md text-center text-[15px] leading-relaxed text-[#63707c]">
          Securely submit and monitor patient information in real time.
        </p>

        <div className="mt-10 flex w-full max-w-sm flex-col gap-3">
          <Link
            href="/patient"
            className="flex h-12 items-center justify-center rounded-[14px] bg-[#001a33] text-[15px] font-medium text-white transition-colors duration-200 hover:bg-[#002b54]"
          >
            Patient Form
          </Link>
          <Link
            href="/staff"
            className="flex h-12 items-center justify-center rounded-[14px] border border-gray-200 bg-white text-[15px] font-medium text-[#001a33] transition-colors duration-200 hover:bg-gray-50"
          >
            Staff Dashboard
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-6 text-center text-xs text-[#63707c]">
        Real-time synchronization between patient and staff views
      </footer>
    </main>
  );
}
