// src/components/Header.js
import React from 'react';
import { Link } from 'react-router-dom';
import Logo from './Logo';

const Header = () => {
  return (
    <header className="bg-dark text-white py-3">
      <div className="container">
        <div className="d-flex justify-content-between align-items-center">
          {/* Brand logo */}
          <Logo />

          {/* Navbar links */}
          <nav className="d-none d-md-flex">
            <ul className="nav">
              <li className="nav-item">
                <a href="#home" className="nav-link">
                  <h5 className='text-white'>Home</h5>
                </a>
              </li>
              <li className="nav-item">
                <a href="#features" className="nav-link">
                  <h5 className='text-white'>Features</h5>
                </a>
              </li>
              <li className="nav-item">
                <a href="#pricing" className="nav-link">
                  <h5 className='text-white'>Pricing</h5>
                </a>
              </li>
              <li className="nav-item">
                <a href="#about" className="nav-link">
                  <h5 className='text-white'>About</h5>
                </a>
              </li>
            </ul>
          </nav>

          {/* Login and Signup Buttons */}
          <div className="d-none d-md-block">
            <Link to="/login" className="btn btn-light me-2">Login</Link>
          </div>

          {/* Mobile menu toggle */}
          <button className="navbar-toggler d-md-none" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon">
            <i className="fa fa-fw fa-bars text-white"></i>
            </span>
          </button>
        </div>

        {/* Mobile Navbar */}
        <div className="collapse d-md-none" id="navbarNav">
          <ul className="nav flex-column mt-3">
            <li className="nav-item">
              <a href="#home" className="nav-link text-white">Home</a>
            </li>
            <li className="nav-item">
              <a href="#features" className="nav-link text-white">Features</a>
            </li>
            <li className="nav-item">
              <a href="#pricing" className="nav-link text-white">Pricing</a>
            </li>
            <li className="nav-item">
              <a href="#about" className="nav-link text-white">About</a>
            </li>
            <li className="nav-item">
              <a href="#login" className="nav-link text-white">Login</a>
            </li>
            <li className="nav-item">
              <a href="#signup" className="nav-link text-white">Signup</a>
            </li>
          </ul>
        </div>
      </div>
    </header>
  );
};

export default Header;
