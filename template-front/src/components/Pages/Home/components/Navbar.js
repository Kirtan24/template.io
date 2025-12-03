"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { FaBars, FaTimes } from "react-icons/fa"

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true)
      } else {
        setScrolled(false)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-white/95 backdrop-blur-md shadow-lg' 
          : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <Link 
            className={`text-2xl font-bold transition-colors ${
              scrolled ? 'text-gray-900' : 'text-white'
            }`}
            to="/"
          >
            AdminPro
          </Link>

          <button 
            className={`md:hidden p-2 rounded-lg transition-colors ${
              scrolled ? 'text-gray-800 hover:bg-gray-100' : 'text-white hover:bg-white/10'
            }`}
            type="button" 
            onClick={toggleMenu}
            aria-label="Toggle navigation"
          >
            {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>

          <div 
            className={`md:flex items-center space-x-8 ${
              isOpen 
                ? 'absolute top-full left-0 right-0 bg-white/95 backdrop-blur-md shadow-lg md:shadow-none md:bg-transparent md:relative md:top-auto p-4 md:p-0 flex flex-col md:flex-row space-y-4 md:space-y-0' 
                : 'hidden'
            }`}
          >
            <a 
              className={`text-lg font-medium transition-colors hover:text-blue-600 ${
                scrolled ? 'text-gray-800' : 'text-white'
              }`}
              href="#home"
              onClick={() => setIsOpen(false)}
            >
              Home
            </a>
            <a 
              className={`text-lg font-medium transition-colors hover:text-blue-600 ${
                scrolled ? 'text-gray-800' : 'text-white'
              }`}
              href="#features"
              onClick={() => setIsOpen(false)}
            >
              Features
            </a>
            <a 
              className={`text-lg font-medium transition-colors hover:text-blue-600 ${
                scrolled ? 'text-gray-800' : 'text-white'
              }`}
              href="#services"
              onClick={() => setIsOpen(false)}
            >
              Services
            </a>
            <a 
              className={`text-lg font-medium transition-colors hover:text-blue-600 ${
                scrolled ? 'text-gray-800' : 'text-white'
              }`}
              href="#about"
              onClick={() => setIsOpen(false)}
            >
              About
            </a>
            <a 
              className={`text-lg font-medium transition-colors hover:text-blue-600 ${
                scrolled ? 'text-gray-800' : 'text-white'
              }`}
              href="#pricing"
              onClick={() => setIsOpen(false)}
            >
              Pricing
            </a>
            <a 
              className={`px-6 py-2 rounded-full font-semibold transition-all duration-300 ${
                scrolled
                  ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg'
                  : 'bg-white text-blue-600 hover:bg-gray-100 shadow-md hover:shadow-lg'
              }`}
              href="#contact"
              onClick={() => setIsOpen(false)}
            >
              Get Started
            </a>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar

