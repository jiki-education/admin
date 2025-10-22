import React, { useState } from "react";
import type { EmailTemplateSummaryResponse } from "../types";
import LocaleStatusBadge from "./LocaleStatusBadge";
import type { SummaryFilters } from "./SummaryFilters";

interface SummaryTableProps {
  summaryData: EmailTemplateSummaryResponse;
  filters?: SummaryFilters;
}

type SortField = "type" | "slug" | "implemented" | "missing" | "wip";
type SortDirection = "asc" | "desc";

function SummaryTable({ summaryData, filters = {} }: SummaryTableProps) {
  const [sortField, setSortField] = useState<SortField>("type");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getFilteredAndSortedTemplates = () => {
    let filtered = [...summaryData.email_templates];

    // Apply filters
    if (filters.type) {
      filtered = filtered.filter(template => template.type === filters.type);
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(template => 
        template.slug.toLowerCase().includes(searchLower) ||
        template.type.toLowerCase().includes(searchLower)
      );
    }

    if (filters.localeStatus && filters.localeStatus !== "all") {
      filtered = filtered.filter(template => {
        const implementedLocales = template.locales;
        const missingLocales = summaryData.locales.supported.filter(
          locale => !implementedLocales.includes(locale)
        );
        const wipLocales = summaryData.locales.wip.filter(
          locale => implementedLocales.includes(locale)
        );

        switch (filters.localeStatus) {
          case "complete":
            return missingLocales.length === 0 && wipLocales.length === 0;
          case "missing":
            return missingLocales.length > 0;
          case "wip":
            return wipLocales.length > 0;
          case "all":
          case undefined:
          default:
            return true;
        }
      });
    }

    // Apply sorting
    return filtered.sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortField) {
        case "type":
          aValue = a.type;
          bValue = b.type;
          break;
        case "slug":
          aValue = a.slug;
          bValue = b.slug;
          break;
        case "implemented":
          aValue = a.locales.length;
          bValue = b.locales.length;
          break;
        case "missing":
          aValue = summaryData.locales.supported.filter(locale => !a.locales.includes(locale)).length;
          bValue = summaryData.locales.supported.filter(locale => !b.locales.includes(locale)).length;
          break;
        case "wip":
          aValue = summaryData.locales.wip.filter(locale => a.locales.includes(locale)).length;
          bValue = summaryData.locales.wip.filter(locale => b.locales.includes(locale)).length;
          break;
        default:
          aValue = a.type;
          bValue = b.type;
      }

      if (typeof aValue === "string" && typeof bValue === "string") {
        const result = aValue.localeCompare(bValue);
        return sortDirection === "asc" ? result : -result;
      } 
        const result = (aValue as number) - (bValue as number);
        return sortDirection === "asc" ? result : -result;
      
    });
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return (
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }
    
    return sortDirection === "asc" ? (
      <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    );
  };

  const filteredAndSortedTemplates = getFilteredAndSortedTemplates();

  return (
    <div className="space-y-6">
      <div className="text-sm text-gray-600 dark:text-gray-400">
        Showing {filteredAndSortedTemplates.length} of {summaryData.email_templates.length} template groups
      </div>
      
      <div className="overflow-x-auto">
        <table 
          className="min-w-full divide-y divide-gray-200 dark:divide-gray-700"
          role="table"
          aria-label="Email template summary table"
        >
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => handleSort("type")}
                onKeyDown={(e) => e.key === 'Enter' && handleSort("type")}
                tabIndex={0}
                role="columnheader"
                aria-sort={sortField === "type" ? (sortDirection === "asc" ? "ascending" : "descending") : "none"}
              >
                <div className="flex items-center space-x-1">
                  <span>Type</span>
                  {getSortIcon("type")}
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => handleSort("slug")}
                onKeyDown={(e) => e.key === 'Enter' && handleSort("slug")}
                tabIndex={0}
                role="columnheader"
                aria-sort={sortField === "slug" ? (sortDirection === "asc" ? "ascending" : "descending") : "none"}
              >
                <div className="flex items-center space-x-1">
                  <span>Slug</span>
                  {getSortIcon("slug")}
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => handleSort("implemented")}
                onKeyDown={(e) => e.key === 'Enter' && handleSort("implemented")}
                tabIndex={0}
                role="columnheader"
                aria-sort={sortField === "implemented" ? (sortDirection === "asc" ? "ascending" : "descending") : "none"}
              >
                <div className="flex items-center space-x-1">
                  <span>Implemented Locales</span>
                  {getSortIcon("implemented")}
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => handleSort("missing")}
                onKeyDown={(e) => e.key === 'Enter' && handleSort("missing")}
                tabIndex={0}
                role="columnheader"
                aria-sort={sortField === "missing" ? (sortDirection === "asc" ? "ascending" : "descending") : "none"}
              >
                <div className="flex items-center space-x-1">
                  <span>Missing Locales</span>
                  {getSortIcon("missing")}
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => handleSort("wip")}
                onKeyDown={(e) => e.key === 'Enter' && handleSort("wip")}
                tabIndex={0}
                role="columnheader"
                aria-sort={sortField === "wip" ? (sortDirection === "asc" ? "ascending" : "descending") : "none"}
              >
                <div className="flex items-center space-x-1">
                  <span>WIP Locales</span>
                  {getSortIcon("wip")}
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {filteredAndSortedTemplates.map((template, index) => {
              const implementedLocales = template.locales;
              const missingLocales = summaryData.locales.supported.filter(
                locale => !implementedLocales.includes(locale)
              );
              const wipLocales = summaryData.locales.wip.filter(
                locale => implementedLocales.includes(locale)
              );
              
              return (
                <tr 
                  key={`${template.type}-${template.slug}`} 
                  className={index % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800'}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {template.type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {template.slug}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-wrap gap-1">
                      {implementedLocales.map(locale => (
                        <LocaleStatusBadge
                          key={locale}
                          locale={locale}
                          status="implemented"
                          templateType={template.type}
                          templateSlug={template.slug}
                        />
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-wrap gap-1">
                      {missingLocales.map(locale => (
                        <LocaleStatusBadge
                          key={locale}
                          locale={locale}
                          status="missing"
                          templateType={template.type}
                          templateSlug={template.slug}
                        />
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-wrap gap-1">
                      {wipLocales.map(locale => (
                        <LocaleStatusBadge
                          key={locale}
                          locale={locale}
                          status="wip"
                          templateType={template.type}
                          templateSlug={template.slug}
                        />
                      ))}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default SummaryTable;