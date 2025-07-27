import React from 'react';

const TopBar = () => (
    <header className="top-navbar bg-yellow-400 p-4 fixed top-0 left-0 w-full z-50 border-b border-yellow-300">
        <nav className="flex justify-between items-center container mx-auto">
            <div className="font-bold text-3xl text-yellow-900">Rem-Docs</div>
            <div>
                <a href="/" className="nav-link px-5 text-yellow-900 hover:underline">Rem-Docsについて</a>
                <a href="/about" className="nav-link text-yellow-900 hover:underline">はじめる</a>
            </div>
        </nav>
    </header>
);

export default TopBar;