import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  User,
  Key,
  CreditCard,
  FileText,
  LogOut,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Award,
  Bell,
  Settings,
  HelpCircle,
  IndianRupee,
  Lock
} from 'lucide-react';
import './Sidebar.css';
import logo from './../../assets/img/logo.png';
import { secureStorage } from '../../utils/secureStorage';
import { useLogout } from "../../hooks/useLogout";
import { useScholar } from '../../hooks/useScholar';
import { useTheme } from '../../contexts/ThemeContext';
import { getAssetUrl } from '../../utils/getCompanyUrl';

const Sidebar = ({ collapsed, onToggle, mobileOpen, setMobileOpen }) => {
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const { mutate: logout } = useLogout();
  const { theme } = useTheme();

  const companyDetails = secureStorage.getCompany();
  const { data: scholarData } = useScholar();

  const companyLogo = getAssetUrl(scholarData?.company?.com_logo) || logo;
  // const companyLogo = `${process.env.REACT_APP_BASE_URL}/${companyDetails?.com_logo}` || `http://scholarapi.seasense.in/${companyDetails?.com_logo}`;

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile && mobileOpen) {
        setMobileOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [mobileOpen]);

  const menuItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/profile', icon: User, label: 'Profile' },
    { path: '/payment-history', icon: IndianRupee, label: 'Payment History' },
    { path: '/complaint-register', icon: FileText, label: 'Complaint Register' },
    { path: '/change-password', icon: Lock, label: 'Change Password' },
  ];

  const handleNavClick = () => {
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const sidebarClasses = `sidebar-premium ${collapsed && !isMobile ? 'collapsed' : ''} ${isMobile ? 'mobile' : ''} ${mobileOpen ? 'mobile-open' : ''}`;

  return (
    <>
      {isMobile && mobileOpen && (
        <div className="sidebar-premium-overlay" onClick={() => setMobileOpen(false)}></div>
      )}

      <div className={sidebarClasses}>
        {/* Header with Logo */}
        <div className="sidebar-premium-header">
          <Link to="/dashboard" className="logo-link">

            <div className="logo-premium-wrapper">
              <div className="logo-premium-icon">
                <GraduationCap size={26} />
              </div>
              {/* {(!collapsed || isMobile) && (
              <div className="logo-premium-text">
                <span className="logo-premium-title">SeaSense</span>
                <span className="logo-premium-subtitle">Scholar Portal</span>
              </div>
            )} */}
              {(!collapsed || isMobile) && <img src={companyLogo} alt="Logo"

                className={`logo-image ${theme === "dark" ? "logo-white" : ""}`}
              />}
            </div>
          </Link>


          {/* {!isMobile && (
            <button className="collapse-premium-btn" onClick={onToggle}>
              {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </button>
          )} */}

          {isMobile && (
            <button className="mobile-premium-close" onClick={() => setMobileOpen(false)}>
              ✕
            </button>
          )}
        </div>


        {/* Navigation Menu */}
        <nav className="sidebar-premium-nav">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `nav-premium-link ${isActive ? 'active' : ''}`
              }
              onClick={handleNavClick}
            >
              <span className="nav-premium-icon">
                <item.icon size={20} />
              </span>
              {(!collapsed || isMobile) && <span className="nav-premium-label">{item.label}</span>}
              {(!collapsed || isMobile) && (
                <span className="nav-premium-indicator"></span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Bottom Section */}
        <div className="sidebar-premium-footer">
          {/* Quick Help Section */}
          {/* {(!collapsed || isMobile) && (
            <div className="premium-help-section">
              <div className="help-premium-card">
                <HelpCircle size={16} />
                <div>
                  <strong>Need Help?</strong>
                  <span>Contact support</span>
                </div>
              </div>
            </div>
          )} */}

          {/* Logout Button */}
          <button onClick={() => logout()} className="logout-premium-btn">
            <LogOut size={20} />
            {(!collapsed || isMobile) && <span>Sign Out</span>}
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;