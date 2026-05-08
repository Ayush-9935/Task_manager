import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, FolderKanban, CheckSquare, Users, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import clsx from 'clsx';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const links = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Projects', path: '/projects', icon: FolderKanban },
    { name: 'Tasks', path: '/tasks', icon: CheckSquare },
    ...(user?.role === 'Admin' ? [{ name: 'Team', path: '/team', icon: Users }] : []),
  ];

  return (
    <div className="flex flex-col w-64 bg-slate-900 border-r border-slate-800 h-screen fixed top-0 left-0 text-slate-300 shadow-2xl z-50">
      <div className="flex items-center justify-center h-20 border-b border-slate-800">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2 tracking-tight">
          <div className="bg-primary-500 p-1.5 rounded-lg shadow-[0_0_15px_rgba(139,92,246,0.5)]">
            <CheckSquare className="w-5 h-5 text-white" />
          </div>
          TaskFlow <span className="text-primary-500">Pro</span>
        </h1>
      </div>
      
      <div className="flex-1 overflow-y-auto py-6">
        <nav className="space-y-2 px-4">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname.includes(link.path);
            return (
              <NavLink
                key={link.name}
                to={link.path}
                className={
                  clsx(
                    'flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group',
                    isActive
                      ? 'bg-primary-500/10 text-primary-400 border border-primary-500/20 shadow-[0_0_15px_rgba(139,92,246,0.05)]'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-transparent'
                  )
                }
              >
                <Icon className={clsx("w-5 h-5 mr-3 flex-shrink-0 transition-transform group-hover:scale-110", isActive ? "text-primary-400" : "text-slate-500 group-hover:text-slate-300")} />
                {link.name}
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-slate-800">
        <button
          onClick={logout}
          className="flex items-center w-full px-4 py-3 text-sm font-medium text-red-400 rounded-xl hover:bg-red-500/10 hover:text-red-300 transition-all group border border-transparent hover:border-red-500/20"
        >
          <LogOut className="w-5 h-5 mr-3 group-hover:-translate-x-1 transition-transform" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
