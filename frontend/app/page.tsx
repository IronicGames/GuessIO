'use client';

import Button from '@/components/ui/Button';

export default function Home() {
  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <div
        className="flex flex-col
        w-1/3 max-w-100 gap-8"
      >
        <Button variant="primary">Public Match</Button>
        <Button variant="primary">Create Lobby</Button>
        <Button variant="primary">Manage Boards</Button>
      </div>

      <div
        className="flex flex-col w-1/3 max-w-100 m-12 gap-8 items-center
        "
      >
        <input
          className="max-w100 h-15 rounded-md text-blue bg-darkblue text-3xl text-center
          placeholder:opacity-100 border shadow-lg/30"
          placeholder="Enter Code"
        />

        <Button
          variant="secondary"
          className="text-xl w-1/2 h-12 text-white! font-normal"
        >
          Donate
        </Button>
      </div>
    </main>
  );
}
