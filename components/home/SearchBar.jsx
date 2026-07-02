'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, MapPin, Loader2, ArrowRight } from 'lucide-react';
import { CITIES } from '@/utils/constants';
import { useDebounce } from '@/hooks/useDebounce';
import { cn } from '@/utils/cn';

export default function SearchBar({ compact = false }) {
  const router = useRouter();
  
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  
  const [querySuggestions, setQuerySuggestions] = useState([]);
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [focusedField, setFocusedField] = useState(null); // 'query' | 'location' | null
  
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  
  const debouncedQuery = useDebounce(query, 300);
  
  const queryContainerRef = useRef(null);
  const locationContainerRef = useRef(null);

  // Fetch role/skill suggestions on query change
  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.trim().length < 2) {
      setQuerySuggestions([]);
      return;
    }
    
    async function fetchSuggestions() {
      setLoadingSuggestions(true);
      try {
        const res = await fetch(`/api/jobs/suggestions?q=${encodeURIComponent(debouncedQuery)}`);
        if (res.ok) {
          const data = await res.json();
          setQuerySuggestions(data.suggestions || []);
        }
      } catch (err) {
        console.error('Error fetching suggestions:', err);
      } finally {
        setLoadingSuggestions(false);
      }
    }
    fetchSuggestions();
  }, [debouncedQuery]);

  // Filter location suggestions based on input
  useEffect(() => {
    if (!location) {
      setLocationSuggestions(CITIES.slice(0, 5)); // Show top 5 cities initially
      return;
    }
    const filtered = CITIES.filter(city => 
      city.toLowerCase().includes(location.toLowerCase())
    );
    setLocationSuggestions(filtered);
  }, [location]);

  // Click outside listener to close dropdowns
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        queryContainerRef.current && !queryContainerRef.current.contains(event.target) &&
        locationContainerRef.current && !locationContainerRef.current.contains(event.target)
      ) {
        setFocusedField(null);
        setActiveSuggestionIndex(-1);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    
    const params = new URLSearchParams();
    if (query.trim()) params.append('q', query.trim());
    if (location.trim()) params.append('city', location.trim());
    
    router.push(`/jobs?${params.toString()}`);
    setFocusedField(null);
  };

  // Keyboard navigation for suggestions dropdown
  const handleKeyDown = (e, type) => {
    const list = type === 'query' ? querySuggestions : locationSuggestions;
    if (list.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveSuggestionIndex(prev => (prev + 1) % list.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveSuggestionIndex(prev => (prev - 1 + list.length) % list.length);
    } else if (e.key === 'Enter') {
      if (activeSuggestionIndex >= 0 && activeSuggestionIndex < list.length) {
        e.preventDefault();
        const selected = list[activeSuggestionIndex];
        if (type === 'query') {
          setQuery(selected);
          setFocusedField('location'); // Jump focus to location field
        } else {
          setLocation(selected);
          handleSearch();
        }
        setActiveSuggestionIndex(-1);
      }
    } else if (e.key === 'Escape') {
      setFocusedField(null);
      setActiveSuggestionIndex(-1);
    }
  };

  return (
    <form 
      onSubmit={handleSearch}
      className={cn(
        "w-full mx-auto bg-surface border border-border shadow-md rounded-lg md:rounded-full flex flex-col md:flex-row items-stretch p-2 gap-2 md:gap-0",
        compact ? "p-1.5 shadow-sm max-w-4xl" : "max-w-5xl"
      )}
    >
      {/* Query Search */}
      <div 
        ref={queryContainerRef}
        className="flex-1 flex items-center gap-2.5 px-4 py-2 md:py-0 border-b md:border-b-0 md:border-r border-border relative"
      >
        <Search className="h-5 w-5 text-ink-3 shrink-0" />
        <div className="flex-1">
          <input
            type="text"
            placeholder="Job title, skills, or company..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveSuggestionIndex(-1);
            }}
            onFocus={() => {
              setFocusedField('query');
              setActiveSuggestionIndex(-1);
            }}
            onKeyDown={(e) => handleKeyDown(e, 'query')}
            className="w-full bg-transparent text-sm md:text-base font-medium text-ink placeholder:text-ink-3 outline-none py-1.5"
          />
        </div>
        
        {/* Query Suggestions Dropdown */}
        {focusedField === 'query' && (querySuggestions.length > 0 || loadingSuggestions) && (
          <div className="absolute top-[110%] left-0 right-0 md:right-auto md:w-[450px] bg-surface border border-border rounded-lg shadow-lg z-50 p-1 mt-1">
            {loadingSuggestions ? (
              <div className="flex items-center gap-2 px-4 py-3 text-sm text-ink-3">
                <Loader2 className="h-4 w-4 animate-spin text-accent" />
                Searching active openings...
              </div>
            ) : (
              <ul className="max-h-60 overflow-y-auto">
                {querySuggestions.map((suggestion, idx) => (
                  <li key={suggestion + idx}>
                    <button
                      type="button"
                      onClick={() => {
                        setQuery(suggestion);
                        setFocusedField('location');
                        setActiveSuggestionIndex(-1);
                      }}
                      className={cn(
                        "w-full text-left px-4 py-2.5 text-sm font-medium rounded transition-colors flex items-center justify-between",
                        idx === activeSuggestionIndex 
                          ? "bg-accent-light text-accent" 
                          : "text-ink-2 hover:bg-grey-50"
                      )}
                    >
                      <span>{suggestion}</span>
                      <span className="text-[10px] text-ink-3 uppercase tracking-wider">Jobs</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {/* Location Search */}
      <div 
        ref={locationContainerRef}
        className="flex-1 flex items-center gap-2.5 px-4 py-2 md:py-0 relative"
      >
        <MapPin className="h-5 w-5 text-ink-3 shrink-0" />
        <div className="flex-1">
          <input
            type="text"
            placeholder="City, State, or 'Remote'..."
            value={location}
            onChange={(e) => {
              setLocation(e.target.value);
              setActiveSuggestionIndex(-1);
            }}
            onFocus={() => {
              setFocusedField('location');
              setActiveSuggestionIndex(-1);
            }}
            onKeyDown={(e) => handleKeyDown(e, 'location')}
            className="w-full bg-transparent text-sm md:text-base font-medium text-ink placeholder:text-ink-3 outline-none py-1.5"
          />
        </div>

        {/* Location Suggestions Dropdown */}
        {focusedField === 'location' && locationSuggestions.length > 0 && (
          <div className="absolute top-[110%] left-0 right-0 md:left-auto md:w-[350px] bg-surface border border-border rounded-lg shadow-lg z-50 p-1 mt-1">
            <div className="px-3 py-1.5 text-[11px] font-bold text-ink-3 uppercase tracking-wider border-b border-border mb-1">
              Popular Locations
            </div>
            <ul className="max-h-60 overflow-y-auto">
              {locationSuggestions.map((city, idx) => (
                <li key={city + idx}>
                  <button
                    type="button"
                    onClick={() => {
                      setLocation(city);
                      setFocusedField(null);
                      setActiveSuggestionIndex(-1);
                      // Trigger search immediately upon selecting location
                      setTimeout(() => {
                        const params = new URLSearchParams();
                        if (query.trim()) params.append('q', query.trim());
                        params.append('city', city);
                        router.push(`/jobs?${params.toString()}`);
                      }, 50);
                    }}
                    className={cn(
                      "w-full text-left px-4 py-2.5 text-sm font-semibold rounded transition-colors flex items-center gap-2",
                      idx === activeSuggestionIndex 
                        ? "bg-accent-light text-accent" 
                        : "text-ink-2 hover:bg-grey-50"
                    )}
                  >
                    <MapPin className="h-4 w-4 shrink-0 text-ink-3" />
                    <span>{city}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Submit Button */}
      <div className="px-2 py-1 md:py-0 flex items-center justify-end shrink-0">
        <button
          type="submit"
          className={cn(
            "w-full md:w-auto inline-flex items-center justify-center gap-1.5 rounded-md md:rounded-full bg-accent font-semibold text-white hover:bg-accent-dark shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2",
            compact ? "px-5 py-2 text-sm" : "px-7 py-3 text-base"
          )}
        >
          Search Jobs
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </form>
  );
}
