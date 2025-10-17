import React, { useState } from "react";

interface LocaleStatusBadgeProps {
  locale: string;
  status: "implemented" | "missing" | "wip";
  templateType?: string;
  templateSlug?: string;
}

function LocaleStatusBadge({ locale, status, templateType, templateSlug }: LocaleStatusBadgeProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  const getStatusConfig = () => {
    switch (status) {
      case "implemented":
        return {
          bgClass: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
          label: "Implemented",
          description: "This locale has been fully implemented and is ready to use"
        };
      case "missing":
        return {
          bgClass: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
          label: "Missing",
          description: "This locale is supported but not yet implemented for this template"
        };
      case "wip":
        return {
          bgClass: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
          label: "Work in Progress",
          description: "This locale is currently being worked on and may not be fully ready"
        };
      default:
        return {
          bgClass: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
          label: "Unknown",
          description: "Status unknown"
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div className="relative inline-block">
      <span 
        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium cursor-help transition-all duration-200 hover:scale-105 ${config.bgClass}`}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        role="tooltip"
        aria-label={`${locale} locale - ${config.label}`}
      >
        {locale}
      </span>
      
      {showTooltip && (
        <div 
          className="absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg whitespace-nowrap dark:bg-gray-700 animate-fade-in"
          role="tooltip"
        >
          <div className="font-medium">{locale} - {config.label}</div>
          <div className="text-gray-300 dark:text-gray-400 mt-1">
            {config.description}
          </div>
          {templateType && templateSlug && (
            <div className="text-gray-400 dark:text-gray-500 mt-1">
              Template: {templateType}/{templateSlug}
            </div>
          )}
          {/* Tooltip arrow */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900 dark:border-t-gray-700" />
        </div>
      )}
    </div>
  );
}

export default LocaleStatusBadge;