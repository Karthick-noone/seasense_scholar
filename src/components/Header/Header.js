import React, { useState, useEffect, useRef } from 'react';
import {
  Menu,
  Bell,
  User,
  Moon,
  Sun,
  ChevronDown,
  LogOut,
  Settings,
  HelpCircle,
  Award,
  PanelLeft,
  Lock,
  X,
  XCircle,
  CheckCircle,
  Clock,
  AlertCircle,
  Info,
  Mail,
  Calendar,
  Activity
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import './Header.css';
import { Link } from 'react-router-dom';
import { secureStorage } from '../../utils/secureStorage';
import { useScholar } from '../../hooks/useScholar';
import { useLogout } from "../../hooks/useLogout";

const Header = ({  setMobileOpen }) => {
  const { theme, toggleTheme } = useTheme();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [scrolled, setScrolled] = useState(false);

  const scholar = secureStorage.getScholar();

const { mutate: logout } = useLogout();

  const { data: scholarData } = useScholar();
  const scholarImage = scholarData?.scholar_profile
    ? `http://scholarapi.seasense.in/${scholarData.scholar_profile}`
    : null;
    
  const notificationRef = useRef();
  const profileRef = useRef();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const notifications = [
    { id: 1, message: 'Your profile has been updated', time: '2 hours ago', read: false, type: 'success' },
    { id: 2, message: 'New scholarship application deadline', time: '1 day ago', read: false, type: 'warning' },
    { id: 3, message: 'Payment successful', time: '2 days ago', read: true, type: 'info' },
    { id: 4, message: 'New course available', time: '3 days ago', read: true, type: 'info' },
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMobileMenu = () => {
    setMobileOpen(true);
  };

  return (
    <header className={`header-glass `}>
      <div className="header-glass-left">
        {isMobile ? (
          <button className="glass-icon-btn mobile-menu-btn" onClick={handleMobileMenu}>
            <PanelLeft size={18} />
          </button>
        ) : (
          null
        )}
      </div>

      <div className="header-glass-right">
        {/* Theme Toggle */}
        <button className="glass-icon-btn theme-toggle" onClick={toggleTheme}>
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>

        {/* Notifications - Redesigned */}
        <div className="notification-glass-wrapper" ref={notificationRef}>
          {/* <button
            className="glass-icon-btn notification-glass-btn"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <Bell size={18} />
            {unreadCount > 0 && <span className="notification-glass-badge">{unreadCount}</span>}
          </button> */}

          {showNotifications && (
            <div className="notification-glass-dropdown">
              <div className="notification-glass-header">
                <div>
                  <h4>Notifications</h4>
                  <p>Stay updated with your latest activities</p>
                </div>
                <button className="mark-all-glass-btn">
                  Mark all read
                </button>
              </div>

              <div className="notification-glass-list">
                {notifications.length > 0 ? (
                  notifications.map(notif => (
                    <div key={notif.id} className={`notification-glass-item ${!notif.read ? 'unread' : ''}`}>
                      <div className={`notification-glass-icon ${notif.type}`}>
                        {notif.type === 'success' && <CheckCircle size={16} />}
                        {notif.type === 'warning' && <AlertCircle size={16} />}
                        {notif.type === 'info' && <Info size={16} />}
                      </div>
                      <div className="notification-glass-content">
                        <p className="notification-glass-message">{notif.message}</p>
                        <div className="notification-glass-time">
                          <Clock size={12} />
                          <span>{notif.time}</span>
                        </div>
                      </div>
                      {!notif.read && <div className="notification-glass-unread-dot"></div>}
                    </div>
                  ))
                ) : (
                  <div className="empty-glass-notifications">
                    <Bell size={40} />
                    <p>No notifications</p>
                    <span>You're all caught up!</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Menu - Redesigned Premium Style */}
        <div className="user-glass-wrapper" ref={profileRef}>
          <button
            className="user-glass-btn"
            onClick={() => setShowUserMenu(!showUserMenu)}
          >
            <div className="user-glass-avatar">
              {scholarImage ? (
                <img src={scholarImage} alt="Profile" className='header-prof-img1' />
              ) : (
                <div className="user-glass-avatar">
                  <span>{scholar?.user_name?.charAt(0) || 'S'}</span>
                </div>
              )}
            </div>
            <div className="user-glass-info">
              <span className="user-glass-name">{scholar?.user_name || 'Scholar'}</span>
              <span className="user-glass-role">{scholar?.user_id}</span>
            </div>
            <ChevronDown size={14} className={`chevron-glass-icon ${showUserMenu ? 'rotated' : ''}`} />
          </button>

          {showUserMenu && (
            <div className="user-glass-dropdown">
              {/* Profile Header */}
              <div className="user-glass-profile-header">
                <div className="user-glass-large-avatar">
                  {scholarImage ? (
                    <img src={scholarImage} alt="Profile" className='header-prof-img2' />
                  ) : (
                    <div className="user-glass-avatar">
                      <span>{scholar?.user_name?.charAt(0) || 'S'}</span>
                    </div>
                  )}
                  {/* <span>{scholar.user_name ? scholar.user_name.charAt(0) : 'S'}</span> */}
                </div>
                <div className="user-glass-profile-info">
                  <h4>{scholar?.user_name || 'Scholar User'}</h4>
                  <p>{scholar?.email || 'scholar@example.com'}</p>
                </div>
              </div>

              {/* <div className="user-glass-stats">
                <div className="stat-item">
                  <Activity size={14} />
                  <span>Projects</span>
                  <strong>12</strong>
                </div>
                <div className="stat-item">
                  <Award size={14} />
                  <span>Achievements</span>
                  <strong>8</strong>
                </div>
              </div> */}

              <div className="user-glass-divider"></div>

              {/* Menu Items */}
              <Link to="/profile" className="user-glass-link" onClick={() => setShowUserMenu(false)}>
                <User size={16} />
                <span>My Profile</span>
              </Link>

              <Link to="/change-password" className="user-glass-link" onClick={() => setShowUserMenu(false)}>
                <Lock size={16} />
                <span>Change Password</span>
              </Link>

              <div className="user-glass-divider"></div>

              <button onClick={() => logout()} className="user-glass-logout">
                <LogOut size={16} />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;