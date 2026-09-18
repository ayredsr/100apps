import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Smartphone, Search, Filter } from 'lucide-react';

// Mock Data
const CATEGORIES = [
  'All',
  'Education & Learning',
  'Calculators & Converters',
  'AI Assistants & Chatbots',
  'Entertainment & Quizzes',
  'Health & Fitness Trackers',
  'Productivity & Organization',
  'Lifestyle & Hobby',
  'Utility & Tools',
  'Finance & Budgeting',
  'Reference & Guides'
];

const mockApps = Array.from({ length: 100 }, (_, i) => {
  const categoryIndex = Math.floor(i / 10);
  const category = CATEGORIES[categoryIndex + 1]; // +1 to skip 'All'
  return {
    id: i + 1,
    title: `App ${i + 1} - ${category.split(' ')[0]}`,
    description: `A wonderful application in the ${category} category to help you achieve your goals.`,
    category,
    color: ['bg-blue-500', 'bg-red-500', 'bg-green-500', 'bg-purple-500', 'bg-yellow-500'][i % 5],
  };
});

function App() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredApps = useMemo(() => {
    return mockApps.filter(app => {
      const matchesCategory = selectedCategory === 'All' || app.category === selectedCategory;
      const matchesSearch = app.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            app.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-center">
          <div className="flex items-center gap-2 text-2xl font-bold text-indigo-600">
            <Smartphone className="w-8 h-8" />
            <span>100 Apps Project</span>
          </div>
          <div className="text-sm font-medium text-gray-500">
            {filteredApps.length} Apps Showing
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Controls */}
        <div className="flex flex-col md:flex-row gap-6 mb-12">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search apps..."
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow bg-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-3 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
            <Filter className="text-gray-400 w-5 h-5 shrink-0" />
            {CATEGORIES.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          <AnimatePresence>
            {filteredApps.map(app => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                key={app.id}
                className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100 flex flex-col h-full"
              >
                <div className={`w-12 h-12 rounded-xl mb-4 flex items-center justify-center text-white ${app.color}`}>
                  <Smartphone className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg mb-2 line-clamp-1">{app.title}</h3>
                <span className="text-xs font-semibold px-2 py-1 bg-gray-100 text-gray-600 rounded-md self-start mb-3">
                  {app.category}
                </span>
                <p className="text-gray-500 text-sm flex-1 line-clamp-3">
                  {app.description}
                </p>
                <button className="mt-6 w-full py-2 bg-gray-50 hover:bg-gray-100 text-indigo-600 font-medium rounded-lg transition-colors text-sm">
                  View App
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {filteredApps.length === 0 && (
          <div className="text-center py-20 text-gray-500">
            No apps found matching your criteria.
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
