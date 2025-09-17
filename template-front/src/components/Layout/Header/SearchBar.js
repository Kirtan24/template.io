// components/Layout/Header/SearchBar.js
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { routeComponents, routePermissions } from '../../../utils/routeConfig';
import { getUserInfo } from '../../../utils/localStorageHelper';
import { hasPermission } from '../../../utils/helpers/permissionCheck';
// import './SearchBar.css'; // Optional if you want to isolate styles

const SearchBar = () => {
  const searchRef = useRef(null);
  const suggestionItemsRef = useRef([]);
  const suggestionListRef = useRef(null);
  const navigate = useNavigate();

  const [searchInput, setSearchInput] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [activeIndex, setActiveIndex] = useState(-1);

  const user = getUserInfo();

  // Handle search filtering
  useEffect(() => {
    const query = searchInput.toLowerCase();

    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    const matches = Object.entries(routeComponents)
      .filter(([route, component]) => {
        const title = component.props.title?.toLowerCase() || '';
        const isSearchable = component.props.searchable !== false;
        const perms = routePermissions[route];
        const hasAccess = !perms || perms.length === 0 || hasPermission(perms, user?.roles);

        return title.includes(query) && isSearchable && hasAccess;
      })
      .sort(([, a], [, b]) => a.props.title.length - b.props.title.length)
      .map(([path, component]) => ({
        path,
        title: component.props.title,
      }));

    setSuggestions(matches);
    setActiveIndex(-1);
  }, [searchInput]);

  // Scroll into view on arrow change
  useEffect(() => {
    if (
      activeIndex >= 0 &&
      suggestionItemsRef.current[activeIndex]
    ) {
      suggestionItemsRef.current[activeIndex].scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [activeIndex]);

  // Highlight matching part
  const highlightMatch = (text) => {
    const lowerText = text.toLowerCase();
    const lowerQuery = searchInput.toLowerCase();
    const start = lowerText.indexOf(lowerQuery);
    if (start === -1 || !searchInput) return text;

    const end = start + searchInput.length;
    return (
      <>
        {text.slice(0, start)}
        <mark>{text.slice(start, end)}</mark>
        {text.slice(end)}
      </>
    );
  };

  const handleKeyDown = (e) => {
    if (!suggestions.length) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault();
      navigate(suggestions[activeIndex].path);
      setSearchInput('');
      setSuggestions([]);
      searchRef.current?.blur();
    } else if (e.key === 'Escape') {
      setSearchInput('');
      setSuggestions([]);
      searchRef.current?.blur();
    }
  };

  // Hide suggestions on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSuggestions([]);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus shortcut: press `/`
  useEffect(() => {
    const handleSlashFocus = (e) => {
      if (e.key === '/' && document.activeElement.tagName !== 'INPUT') {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleSlashFocus);
    return () => window.removeEventListener('keydown', handleSlashFocus);
  }, []);

  return (
    <div className="app-search d-none d-lg-block" style={{ position: 'relative' }}>
      <input
        ref={searchRef}
        type="text"
        className="form-control"
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Search (press '/' to focus)"
      />

      <span className="bx bx-search-alt mt-3"></span>

      {suggestions.length > 0 && (
        <ul
          className="dropdown-menu show"
          style={{
            display: 'block',
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            zIndex: 1000,
            maxHeight: '250px',
            overflowY: 'auto'
          }}
          ref={suggestionListRef}
        >
          {suggestions.map((item, index) => (
            <li
              key={item.path}
              ref={(el) => suggestionItemsRef.current[index] = el}
              className={`dropdown-item ${index === activeIndex ? 'active' : ''}`}
              onMouseDown={() => {
                navigate(item.path);
                setSearchInput('');
                setSuggestions([]);
              }}
            >
              {highlightMatch(item.title)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchBar;
