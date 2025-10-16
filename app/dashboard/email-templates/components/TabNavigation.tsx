import React from "react";

interface TabNavigationProps {
  activeTab: "templates" | "summary";
  onTabChange: (tab: "templates" | "summary") => void;
}

function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  const getButtonClass = (tab: "templates" | "summary") =>
    activeTab === tab
      ? "shadow-theme-xs text-gray-900 dark:text-white bg-white dark:bg-gray-800"
      : "text-gray-500 dark:text-gray-400";

  return (
    <div className="flex items-center gap-0.5 rounded-lg bg-gray-100 p-0.5 dark:bg-gray-900">
      <button
        onClick={() => onTabChange("templates")}
        className={`px-3 py-2 font-medium w-full rounded-md text-theme-sm hover:text-gray-900 dark:hover:text-white ${getButtonClass(
          "templates"
        )}`}
      >
        Templates
      </button>

      <button
        onClick={() => onTabChange("summary")}
        className={`px-3 py-2 font-medium w-full rounded-md text-theme-sm hover:text-gray-900 dark:hover:text-white ${getButtonClass(
          "summary"
        )}`}
      >
        Summary
      </button>
    </div>
  );
}

export default TabNavigation;