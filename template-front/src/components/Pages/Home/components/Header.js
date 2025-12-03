// src/components/Header.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Logo from './Logo';
import { FaBars, FaTimes } from 'react-icons/fa';

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled 
          ? 'bg-white/80 backdrop-blur-xl shadow-xl border-b border-gray-100' 
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Logo />

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            <a 
              href="#home" 
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                scrolled 
                  ? 'text-gray-700 hover:text-blue-600 hover:bg-blue-50' 
                  : 'text-white hover:text-blue-200 hover:bg-white/10'
              }`}
            >
              Home
            </a>
            <a 
              href="#features" 
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                scrolled 
                  ? 'text-gray-700 hover:text-blue-600 hover:bg-blue-50' 
                  : 'text-white hover:text-blue-200 hover:bg-white/10'
              }`}
            >
              Features
            </a>
            <a 
              href="#services" 
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                scrolled 
                  ? 'text-gray-700 hover:text-blue-600 hover:bg-blue-50' 
                  : 'text-white hover:text-blue-200 hover:bg-white/10'
              }`}
            >
              Services
            </a>
            <a 
              href="#about" 
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                scrolled 
                  ? 'text-gray-700 hover:text-blue-600 hover:bg-blue-50' 
                  : 'text-white hover:text-blue-200 hover:bg-white/10'
              }`}
            >
              About
            </a>
            <a 
              href="#pricing" 
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                scrolled 
                  ? 'text-gray-700 hover:text-blue-600 hover:bg-blue-50' 
                  : 'text-white hover:text-blue-200 hover:bg-white/10'
              }`}
            >
              Pricing
            </a>
          </nav>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center space-x-4">
            <Link 
              to="/login" 
              className={`px-6 py-2.5 rounded-xl font-semibold transition-all duration-300 ${
                scrolled
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg hover:shadow-xl hover:scale-105'
                  : 'bg-white/10 backdrop-blur-sm text-white border border-white/20 hover:bg-white hover:text-blue-600'
              }`}
            >
              Login
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className={`lg:hidden p-2 rounded-lg transition-all ${
              scrolled 
                ? 'text-gray-800 hover:bg-gray-100' 
                : 'text-white hover:bg-white/10'
            }`}
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        <div 
          className={`lg:hidden overflow-hidden transition-all duration-300 ${
            isOpen ? 'max-h-screen opacity-100 pb-6' : 'max-h-0 opacity-0'
          }`}
        >
          <nav className="flex flex-col space-y-2 pt-4">
            <a 
              href="#home" 
              className={`px-4 py-3 rounded-xl font-medium transition-all ${
                scrolled 
                  ? 'text-gray-700 hover:bg-blue-50' 
                  : 'text-white hover:bg-white/10'
              }`}
              onClick={() => setIsOpen(false)}
            >
              Home
            </a>
            <a 
              href="#features" 
              className={`px-4 py-3 rounded-xl font-medium transition-all ${
                scrolled 
                  ? 'text-gray-700 hover:bg-blue-50' 
                  : 'text-white hover:bg-white/10'
              }`}
              onClick={() => setIsOpen(false)}
            >
              Features
            </a>
            <a 
              href="#services" 
              className={`px-4 py-3 rounded-xl font-medium transition-all ${
                scrolled 
                  ? 'text-gray-700 hover:bg-blue-50' 
                  : 'text-white hover:bg-white/10'
              }`}
              onClick={() => setIsOpen(false)}
            >
              Services
            </a>
            <a 
              href="#about" 
              className={`px-4 py-3 rounded-xl font-medium transition-all ${
                scrolled 
                  ? 'text-gray-700 hover:bg-blue-50' 
                  : 'text-white hover:bg-white/10'
              }`}
              onClick={() => setIsOpen(false)}
            >
              About
            </a>
            <a 
              href="#pricing" 
              className={`px-4 py-3 rounded-xl font-medium transition-all ${
                scrolled 
                  ? 'text-gray-700 hover:bg-blue-50' 
                  : 'text-white hover:bg-white/10'
              }`}
              onClick={() => setIsOpen(false)}
            >
              Pricing
            </a>
            <Link 
              to="/login" 
              className={`mt-2 px-4 py-3 rounded-xl font-semibold text-center transition-all ${
                scrolled
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'
                  : 'bg-white text-blue-600'
              }`}
              onClick={() => setIsOpen(false)}
            >
              Login
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
