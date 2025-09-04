import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { DashboardIcon, FilmIcon, TvIcon, UsersIcon, CogIcon, LogoutIcon, SunIcon, XIcon, MenuIcon, MegaphoneIcon, BoltIcon, ShieldCheckIcon, HeartIcon } from '../Icons';

interface SidebarProps {
  isSidebarOpen: boolean;
  setSidebarOpen: (isOpen: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isSidebarOpen, setSidebarOpen }) => {
  const navigate = useNavigate();
  
  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    navigate('/admin/login');
  };

  const navItems = [
    { name: 'Dashboard', icon: DashboardIcon, path: '/admin/dashboard' },
    { name: 'Movies', icon: FilmIcon, path: '/admin/movies' },
    { name: 'Series', icon: TvIcon, path: '/admin/series' },
    { name: 'Anime', icon: SunIcon, path: '/admin/anime' },
    { name: 'K-Drama', icon: HeartIcon, path: '/admin/kdrama' },
    { name: 'AI Importer', icon: BoltIcon, path: '/admin/import' },
    { name: 'Ad Management', icon: MegaphoneIcon, path: '/admin/ads' },
    { name: 'Users', icon: UsersIcon, path: '/admin/users' },
  ];

  const bottomItems = [
    { name: 'Settings', icon: CogIcon, path: '/admin/settings' },
    { name: 'Security', icon: ShieldCheckIcon, path: '/admin/settings/security' },
  ]

  const NavItem: React.FC<{item: {name: string, icon: React.FC<any>, path: string}}> = ({ item }) => (
    <li>
      <NavLink
        to={item.path}
        end={item.path === '/admin/dashboard'}
        className={({ isActive }) =>
          `flex items-center p-3 my-1 rounded-lg transition-colors duration-200 ${
            isActive
              ? 'bg-cyan-500 text-slate-900 font-semibold shadow-lg'
              : 'text-gray-300 hover:bg-gray-700 hover:text-white'
          }`
        }
        onClick={() => { if (isSidebarOpen) setSidebarOpen(false); }}
      >
        <item.icon className="w-6 h-6 mr-4 flex-shrink-0" />
        <span className="truncate">{item.name}</span>
      </NavLink>
    </li>
  );

  return (
    <>
      {/* Overlay for mobile */}
      <div 
        className={`fixed inset-0 bg-black/60 z-30 lg:hidden transition-opacity ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setSidebarOpen(false)}
      ></div>

      <aside className={`fixed top-0 left-0 h-full w-64 bg-gray-900 border-r border-gray-700/50 flex-col z-40
                        transform transition-transform duration-300 ease-in-out lg:translate-x-0
                        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          {/* Logo and Close Button */}
          <div className="flex items-center justify-between h-20 px-4 border-b border-gray-700/50 flex-shrink-0">
            <Link to="/admin" className="flex items-center">
              <img className="h-10 w-auto" src="https://i.ibb.co/hZ5g0J1/Movie-Hub-BD-Logo.png" alt="MovieHubBD Logo" />
              <span className="text-white font-bold ml-2 text-sm bg-cyan-500/20 text-cyan-300 px-2 py-1 rounded-md">ADMIN</span>
            </Link>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-400 hover:text-white">
                <XIcon className="w-6 h-6"/>
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-grow px-4 py-4 overflow-y-auto">
            <ul>
              {navItems.map(item => <NavItem key={item.name} item={item} />)}
            </ul>
          </nav>

           {/* Bottom Actions */}
          <div className="px-4 py-4 border-t border-gray-700/50 flex-shrink-0">
             <ul>
              {bottomItems.map(item => <NavItem key={item.name} item={item} />)}
              <li>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center p-3 my-1 rounded-lg transition-colors duration-200 text-gray-300 hover:bg-gray-700 hover:text-white"
                >
                  <LogoutIcon className="w-6 h-6 mr-4 flex-shrink-0" />
                  <span className="truncate">Logout</span>
                </button>
              </li>
            </ul>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;