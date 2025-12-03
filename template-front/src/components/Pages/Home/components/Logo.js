import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

const Logo = ({ scrolled }) => {
  return (
    <Link 
      to="/" 
      className="flex items-center gap-3 group"
    >
      <div className="relative">
        <img
          src="./assets/images/img/template_2.io.png"
          alt="Template.io Logo"
          className="w-10 h-10 sm:w-12 sm:h-12 object-contain transition-transform duration-300 group-hover:scale-110"
        />
      </div>
      <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
        Template.io
      </span>
    </Link>
  );
};

export default Logo;
