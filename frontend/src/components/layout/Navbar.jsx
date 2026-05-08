import { useAuth } from '../../context/AuthContext';
import { Menu, Search, Bell } from 'lucide-react';

const Navbar = ({ toggleSidebar }) => {
  const { user, searchQuery, setSearchQuery } = useAuth();

  return (
    <header className="glass h-20 flex items-center justify-between px-6 sm:px-8 sticky top-0 z-40 transition-all duration-300">
      <div className="flex items-center flex-1">
        <button
          onClick={toggleSidebar}
          className="lg:hidden text-gray-500 hover:text-gray-700 focus:outline-none mr-4"
        >
          <Menu className="w-6 h-6" />
        </button>
        
        <div className="hidden sm:flex items-center bg-gray-50/80 px-4 py-2.5 rounded-xl border border-gray-200/60 focus-within:ring-2 focus-within:ring-primary-500/20 focus-within:border-primary-400 focus-within:bg-white transition-all w-full max-w-md shadow-sm">
          <Search className="w-4 h-4 text-gray-400 mr-2" />
          <input 
            type="text" 
            placeholder="Search projects, tasks..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none focus:outline-none text-sm w-full text-gray-700 placeholder-gray-400"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-6">
        <button className="relative text-gray-400 hover:text-primary-600 transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>

        <div className="h-8 w-px bg-gray-200"></div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-slate-800">{user?.name}</p>
            <p className="text-xs text-primary-600 font-medium">{user?.role}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md hover:shadow-lg transform hover:scale-105 transition-all cursor-pointer border-2 border-white">
            {user?.name?.charAt(0) || 'U'}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
