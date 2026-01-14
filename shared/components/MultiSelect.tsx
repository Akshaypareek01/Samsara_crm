"use client";
import React, { useState, useRef, useEffect } from 'react';

interface MultiSelectProps {
  options: string[];
  value: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  maxHeight?: string;
  searchable?: boolean;
  showTags?: boolean; // If false, shows only count instead of tags
}

const MultiSelect: React.FC<MultiSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Select options...',
  label,
  required = false,
  maxHeight = '200px',
  searchable = true,
  showTags = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const filteredOptions = searchable
    ? options.filter((option) =>
        option.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : options;

  const toggleOption = (option: string) => {
    const newValue = value.includes(option)
      ? value.filter((v) => v !== option)
      : [...value, option];
    onChange(newValue);
  };

  const removeTag = (option: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(value.filter((v) => v !== option));
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {label && (
        <label className="form-label">
          {label}
          {required && <span className="text-danger"> *</span>}
        </label>
      )}
      
      {/* Selected Tags Display */}
      <div
        className="form-control min-h-[46px] flex items-center flex-wrap gap-2 p-2.5 cursor-pointer hover:border-primary focus-within:border-primary transition-colors relative border-2"
        onClick={() => setIsOpen(!isOpen)}
      >
        {value.length === 0 ? (
          <span className="text-muted text-sm">{placeholder}</span>
        ) : showTags ? (
          <div className="flex flex-wrap gap-1.5 w-full pr-8">
            {value.map((selected) => (
              <span
                key={selected}
                className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary/10 text-primary rounded text-xs font-normal border border-primary/20 hover:bg-primary/15 transition-colors group"
              >
                <span className="truncate max-w-[120px] sm:max-w-[150px]">{selected}</span>
                <button
                  type="button"
                  onClick={(e) => removeTag(selected, e)}
                  className="hover:bg-primary/30 rounded-full p-0.5 transition-colors focus:outline-none flex-shrink-0 opacity-70 group-hover:opacity-100"
                  aria-label={`Remove ${selected}`}
                >
                  <i className="ri-close-line text-[10px]"></i>
                </button>
              </span>
            ))}
          </div>
        ) : (
          <span className="text-defaulttextcolor text-sm font-medium pr-8">
            {value.length} {value.length === 1 ? 'option' : 'options'} selected
          </span>
        )}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none flex-shrink-0">
          <i className={`ri-arrow-down-s-line text-muted text-lg transition-transform ${isOpen ? 'rotate-180' : ''}`}></i>
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div
          className="absolute z-50 w-full mt-1 bg-white dark:bg-bodybg border-2 border-defaultborder rounded-lg shadow-xl overflow-hidden"
          style={{ maxHeight }}
        >
          {searchable && (
            <div className="p-3 border-b-2 border-defaultborder bg-gray-50 dark:bg-bodybg">
              <div className="relative">
                <input
                  type="text"
                  className="form-control form-control-sm px-3 border-2 focus:border-primary"
                  placeholder="Search options..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  onFocus={(e) => e.stopPropagation()}
                  autoFocus
                />
              </div>
            </div>
          )}
          <div className="overflow-y-auto" style={{ maxHeight: `calc(${maxHeight} - ${searchable ? '60px' : '0px'})` }}>
            {filteredOptions.length === 0 ? (
              <div className="p-4 text-center text-muted text-sm">
                <i className="ri-search-line text-2xl mb-2 d-block"></i>
                No options found
              </div>
            ) : (
              filteredOptions.map((option) => {
                const isSelected = value.includes(option);
                return (
                  <div
                    key={option}
                    className={`px-3 py-2 cursor-pointer hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors flex items-center gap-2 ${
                      isSelected ? 'bg-primary/10 dark:bg-primary/20' : ''
                    }`}
                    onClick={() => toggleOption(option)}
                  >
                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                      isSelected
                        ? 'bg-primary border-primary'
                        : 'border-defaultborder hover:border-primary/50'
                    }`}>
                      {isSelected && (
                        <i className="ri-check-line text-white text-[10px]"></i>
                      )}
                    </div>
                    <span className={`text-xs flex-1 ${isSelected ? 'font-medium text-primary' : 'text-defaulttextcolor'}`}>
                      {option}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {value.length > 0 && showTags && (
        <small className="text-muted text-sm mt-1 d-block">
          {value.length} {value.length === 1 ? 'option' : 'options'} selected
        </small>
      )}
    </div>
  );
};

export default MultiSelect;
