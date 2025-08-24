import React from 'react';

export default function FloatingAction({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-5 right-5 p-3 rounded-full bg-accent text-white shadow-lg hover:shadow-xl transition"
      aria-label="Floating Action Button"
    >
      <span className="material-icons">add</span>
    </button>
  );
}