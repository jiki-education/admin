import type { SceneConfig } from "@/lib/remotion/types";

export interface SceneTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  tags: string[];
  config: SceneConfig;
  previewImage?: string;
}

export const SCENE_CATEGORIES = [
  "JavaScript Basics",
  "React Components", 
  "TypeScript",
  "CSS Animations",
  "Node.js",
  "Data Structures",
  "Algorithms",
  "Web APIs",
  "Best Practices"
] as const;

export type SceneCategory = typeof SCENE_CATEGORIES[number];

export const SCENE_TEMPLATES: SceneTemplate[] = [
  {
    id: "js-variables",
    name: "JavaScript Variables",
    description: "Basic variable declaration and assignment in JavaScript",
    category: "JavaScript Basics",
    difficulty: "beginner",
    tags: ["variables", "let", "const", "var"],
    config: {
      title: "JavaScript Variables",
      theme: "dark",
      backgroundColor: "#1e1e1e",
      actions: [
        {
          type: "type",
          code: "// Variable declaration with let",
          speed: "normal",
          language: "javascript"
        },
        {
          type: "pause",
          duration: 0.5
        },
        {
          type: "type",
          code: "\nlet userName = \"Alice\";",
          speed: "normal",
          language: "javascript"
        },
        {
          type: "pause",
          duration: 1.0
        },
        {
          type: "type",
          code: "\n\n// Constant declaration",
          speed: "normal",
          language: "javascript"
        },
        {
          type: "pause",
          duration: 0.5
        },
        {
          type: "type",
          code: "\nconst PI = 3.14159;",
          speed: "normal",
          language: "javascript"
        }
      ]
    }
  },
  {
    id: "js-functions",
    name: "JavaScript Functions",
    description: "Function declaration and arrow functions",
    category: "JavaScript Basics",
    difficulty: "beginner",
    tags: ["functions", "arrow-functions", "parameters"],
    config: {
      title: "JavaScript Functions",
      theme: "dark",
      backgroundColor: "#1e1e1e",
      actions: [
        {
          type: "type",
          code: "// Function declaration",
          speed: "normal",
          language: "javascript"
        },
        {
          type: "pause",
          duration: 0.5
        },
        {
          type: "type",
          code: "\nfunction greet(name) {",
          speed: "normal",
          language: "javascript"
        },
        {
          type: "type",
          code: "\n  return `Hello, ${name}!`;",
          speed: "normal",
          language: "javascript"
        },
        {
          type: "type",
          code: "\n}",
          speed: "normal",
          language: "javascript"
        },
        {
          type: "pause",
          duration: 1.0
        },
        {
          type: "type",
          code: "\n\n// Arrow function",
          speed: "normal",
          language: "javascript"
        },
        {
          type: "pause",
          duration: 0.5
        },
        {
          type: "type",
          code: "\nconst add = (a, b) => a + b;",
          speed: "normal",
          language: "javascript"
        }
      ]
    }
  },
  {
    id: "react-component",
    name: "React Functional Component",
    description: "Creating a basic React functional component with props",
    category: "React Components",
    difficulty: "intermediate",
    tags: ["react", "components", "props", "jsx"],
    config: {
      title: "React Functional Component",
      theme: "dark",
      backgroundColor: "#1e1e1e",
      actions: [
        {
          type: "type",
          code: "import React from 'react';",
          speed: "normal",
          language: "typescript"
        },
        {
          type: "pause",
          duration: 0.8
        },
        {
          type: "type",
          code: "\n\ninterface Props {",
          speed: "normal",
          language: "typescript"
        },
        {
          type: "type",
          code: "\n  title: string;",
          speed: "normal",
          language: "typescript"
        },
        {
          type: "type",
          code: "\n  children: React.ReactNode;",
          speed: "normal",
          language: "typescript"
        },
        {
          type: "type",
          code: "\n}",
          speed: "normal",
          language: "typescript"
        },
        {
          type: "pause",
          duration: 1.0
        },
        {
          type: "type",
          code: "\n\nfunction Card({ title, children }: Props) {",
          speed: "normal",
          language: "typescript"
        },
        {
          type: "type",
          code: "\n  return (",
          speed: "normal",
          language: "typescript"
        },
        {
          type: "type",
          code: "\n    <div className=\"card\">",
          speed: "normal",
          language: "typescript"
        },
        {
          type: "type",
          code: "\n      <h2>{title}</h2>",
          speed: "normal",
          language: "typescript"
        },
        {
          type: "type",
          code: "\n      {children}",
          speed: "normal",
          language: "typescript"
        },
        {
          type: "type",
          code: "\n    </div>",
          speed: "normal",
          language: "typescript"
        },
        {
          type: "type",
          code: "\n  );",
          speed: "normal",
          language: "typescript"
        },
        {
          type: "type",
          code: "\n}",
          speed: "normal",
          language: "typescript"
        }
      ]
    }
  },
  {
    id: "ts-interface",
    name: "TypeScript Interface",
    description: "Defining and using TypeScript interfaces",
    category: "TypeScript",
    difficulty: "intermediate",
    tags: ["typescript", "interface", "types"],
    config: {
      title: "TypeScript Interface",
      theme: "dark",
      backgroundColor: "#1e1e1e",
      actions: [
        {
          type: "type",
          code: "// Define an interface",
          speed: "normal",
          language: "typescript"
        },
        {
          type: "pause",
          duration: 0.5
        },
        {
          type: "type",
          code: "\ninterface User {",
          speed: "normal",
          language: "typescript"
        },
        {
          type: "type",
          code: "\n  id: number;",
          speed: "normal",
          language: "typescript"
        },
        {
          type: "type",
          code: "\n  name: string;",
          speed: "normal",
          language: "typescript"
        },
        {
          type: "type",
          code: "\n  email: string;",
          speed: "normal",
          language: "typescript"
        },
        {
          type: "type",
          code: "\n  isActive?: boolean;",
          speed: "normal",
          language: "typescript"
        },
        {
          type: "type",
          code: "\n}",
          speed: "normal",
          language: "typescript"
        },
        {
          type: "pause",
          duration: 1.0
        },
        {
          type: "type",
          code: "\n\n// Use the interface",
          speed: "normal",
          language: "typescript"
        },
        {
          type: "pause",
          duration: 0.5
        },
        {
          type: "type",
          code: "\nconst user: User = {",
          speed: "normal",
          language: "typescript"
        },
        {
          type: "type",
          code: "\n  id: 1,",
          speed: "normal",
          language: "typescript"
        },
        {
          type: "type",
          code: "\n  name: \"John Doe\",",
          speed: "normal",
          language: "typescript"
        },
        {
          type: "type",
          code: "\n  email: \"john@example.com\"",
          speed: "normal",
          language: "typescript"
        },
        {
          type: "type",
          code: "\n};",
          speed: "normal",
          language: "typescript"
        }
      ]
    }
  },
  {
    id: "css-animation",
    name: "CSS Animations",
    description: "Creating smooth CSS animations with keyframes",
    category: "CSS Animations",
    difficulty: "intermediate",
    tags: ["css", "animations", "keyframes", "transitions"],
    config: {
      title: "CSS Animations",
      theme: "dark",
      backgroundColor: "#1e1e1e",
      actions: [
        {
          type: "type",
          code: "/* Define keyframes */",
          speed: "normal",
          language: "css"
        },
        {
          type: "pause",
          duration: 0.5
        },
        {
          type: "type",
          code: "\n@keyframes fadeIn {",
          speed: "normal",
          language: "css"
        },
        {
          type: "type",
          code: "\n  from {",
          speed: "normal",
          language: "css"
        },
        {
          type: "type",
          code: "\n    opacity: 0;",
          speed: "normal",
          language: "css"
        },
        {
          type: "type",
          code: "\n    transform: translateY(20px);",
          speed: "normal",
          language: "css"
        },
        {
          type: "type",
          code: "\n  }",
          speed: "normal",
          language: "css"
        },
        {
          type: "type",
          code: "\n  to {",
          speed: "normal",
          language: "css"
        },
        {
          type: "type",
          code: "\n    opacity: 1;",
          speed: "normal",
          language: "css"
        },
        {
          type: "type",
          code: "\n    transform: translateY(0);",
          speed: "normal",
          language: "css"
        },
        {
          type: "type",
          code: "\n  }",
          speed: "normal",
          language: "css"
        },
        {
          type: "type",
          code: "\n}",
          speed: "normal",
          language: "css"
        },
        {
          type: "pause",
          duration: 1.0
        },
        {
          type: "type",
          code: "\n\n/* Apply animation */",
          speed: "normal",
          language: "css"
        },
        {
          type: "pause",
          duration: 0.5
        },
        {
          type: "type",
          code: "\n.fade-in {",
          speed: "normal",
          language: "css"
        },
        {
          type: "type",
          code: "\n  animation: fadeIn 0.5s ease-out;",
          speed: "normal",
          language: "css"
        },
        {
          type: "type",
          code: "\n}",
          speed: "normal",
          language: "css"
        }
      ]
    }
  },
  {
    id: "array-methods",
    name: "JavaScript Array Methods",
    description: "Common array methods: map, filter, and reduce",
    category: "JavaScript Basics",
    difficulty: "intermediate",
    tags: ["arrays", "map", "filter", "reduce", "functional-programming"],
    config: {
      title: "JavaScript Array Methods",
      theme: "dark",
      backgroundColor: "#1e1e1e",
      actions: [
        {
          type: "type",
          code: "const numbers = [1, 2, 3, 4, 5];",
          speed: "normal",
          language: "javascript"
        },
        {
          type: "pause",
          duration: 1.0
        },
        {
          type: "type",
          code: "\n\n// Map: transform each element",
          speed: "normal",
          language: "javascript"
        },
        {
          type: "pause",
          duration: 0.5
        },
        {
          type: "type",
          code: "\nconst doubled = numbers.map(n => n * 2);",
          speed: "normal",
          language: "javascript"
        },
        {
          type: "pause",
          duration: 1.0
        },
        {
          type: "type",
          code: "\n\n// Filter: select elements",
          speed: "normal",
          language: "javascript"
        },
        {
          type: "pause",
          duration: 0.5
        },
        {
          type: "type",
          code: "\nconst evens = numbers.filter(n => n % 2 === 0);",
          speed: "normal",
          language: "javascript"
        },
        {
          type: "pause",
          duration: 1.0
        },
        {
          type: "type",
          code: "\n\n// Reduce: accumulate values",
          speed: "normal",
          language: "javascript"
        },
        {
          type: "pause",
          duration: 0.5
        },
        {
          type: "type",
          code: "\nconst sum = numbers.reduce((acc, n) => acc + n, 0);",
          speed: "normal",
          language: "javascript"
        }
      ]
    }
  }
];

export function getTemplatesByCategory(category: SceneCategory): SceneTemplate[] {
  return SCENE_TEMPLATES.filter(template => template.category === category);
}

export function getTemplatesByDifficulty(difficulty: SceneTemplate["difficulty"]): SceneTemplate[] {
  return SCENE_TEMPLATES.filter(template => template.difficulty === difficulty);
}

export function searchTemplates(query: string): SceneTemplate[] {
  const lowercaseQuery = query.toLowerCase();
  return SCENE_TEMPLATES.filter(template => 
    template.name.toLowerCase().includes(lowercaseQuery) ||
    template.description.toLowerCase().includes(lowercaseQuery) ||
    template.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
  );
}

export function getTemplateById(id: string): SceneTemplate | undefined {
  return SCENE_TEMPLATES.find(template => template.id === id);
}