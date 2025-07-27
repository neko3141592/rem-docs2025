import React, { useState, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MenuIcon,
  XIcon,
  UserCircleIcon,
  ClipboardListIcon,
  CogIcon,
  LogoutIcon,
} from '@heroicons/react/outline';
import { Link, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { AuthContext } from '../AuthContext';

type NavItem = {
  name: string;
  href: string;
  icon: React.ReactNode;
};



const NavBar = () => {
  const { user } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const navItems: NavItem[] = [
    { name: 'プロフィール', href: `/user/${user.uid}`, icon: <UserCircleIcon className="h-5 w-5 mr-2" /> },
    { name: 'タスクの管理', href: '/tasks', icon: <ClipboardListIcon className="h-5 w-5 mr-2" /> },
    { name: '設定', href: '/settings', icon: <CogIcon className="h-5 w-5 mr-2" /> },
  ];

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/'); // ログアウト後にトップページへリダイレクト
    } catch (error) {
      console.error('ログアウトエラー:', error);
    }
  };

  return (
    <header className="backdrop-blur-md bg-yellow-400 fixed top-0 left-0 w-full z-50 border-b border-yellow-300 shadow-sm">
      <nav className="flex justify-between items-center container mx-auto px-4 py-4">
        <h1 className="text-3xl font-bold text-yellow-900 tracking-wide">
          Rem-Docs
        </h1>

        <div className="hidden lg:flex space-x-8 items-center">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className="flex items-center text-black hover:text-yellow-700 transition-colors duration-300 font-medium"
            >
              {item.icon}
              {item.name}
            </Link>
          ))}

          {user && (
            <button
              onClick={handleLogout}
              className="flex items-center text-black hover:text-red-500 transition-colors duration-300 font-medium"
            >
              <LogoutIcon className="h-5 w-5 mr-2" />
              ログアウト
            </button>
          )}
        </div>

        <button
          className="lg:hidden p-2 rounded-md text-yellow-900 hover:bg-yellow-300 transition"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="メニュー"
        >
          {isOpen ? <XIcon className="h-8 w-8" /> : <MenuIcon className="h-8 w-8" />}
        </button>
      </nav>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="lg:hidden bg-yellow-400 border-t border-yellow-300 overflow-hidden"
          >
            <div className="flex flex-col items-center py-4 space-y-4">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center text-black text-lg font-medium hover:text-yellow-700 transition-colors duration-300 px-4 py-2 w-full"
                >
                  {item.icon}
                  {item.name}
                </Link>
              ))}

              {user && (
                <button
                  onClick={() => {
                    handleLogout();
                    setIsOpen(false);
                  }}
                  className="flex items-center justify-center text-black text-lg font-medium hover:text-red-500 transition-colors duration-300 px-4 py-2 w-full"
                >
                  <LogoutIcon className="h-5 w-5 mr-2" />
                  ログアウト
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default NavBar;
