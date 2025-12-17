'use client';

import { useState } from 'react';

interface TagListProps {
  tags: string[];
  serverId: string;
  maxInitial?: number;
}

// Generate consistent colors for tags
function getTagColor(tag: string): string {
  const colors = [
    'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200',
    'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-200',
    'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200',
    'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200',
    'bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-200',
    'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200',
    'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200',
    'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-200',
    'bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-200',
    'bg-cyan-100 text-cyan-700 dark:bg-cyan-900 dark:text-cyan-200',
  ];
  
  let hash = 0;
  for (let i = 0; i < tag.length; i++) {
    hash = tag.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export default function TagList({ tags, serverId, maxInitial = 3 }: TagListProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  if (!tags || tags.length === 0) {
    return null;
  }

  const displayedTags = isExpanded ? tags : tags.slice(0, maxInitial);
  const remainingCount = tags.length - maxInitial;

  return (
    <div className="flex flex-wrap gap-2">
      {displayedTags.map((tag, index) => (
        <span
          key={`${serverId}-tag-${index}`}
          className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getTagColor(tag)}`}
        >
          {tag}
        </span>
      ))}
      {!isExpanded && remainingCount > 0 && (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsExpanded(true);
          }}
          className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-200 text-gray-600 dark:bg-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
        >
          +{remainingCount} more
        </button>
      )}
      {isExpanded && tags.length > maxInitial && (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsExpanded(false);
          }}
          className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-200 text-gray-600 dark:bg-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
        >
          Show less
        </button>
      )}
    </div>
  );
}
