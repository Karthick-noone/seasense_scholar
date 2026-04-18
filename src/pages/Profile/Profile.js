import React, { useState, useEffect, useRef } from 'react';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  BookOpen,
  Award,
  GraduationCap,
  Building,
  Users,
  FileText,
  BriefcaseBusiness,
  Camera,
  Clock,
  CheckCircle,
  TrendingUp,
  Star,
  Github,
  Twitter,
  X,
  Trash,
  Trash2,
  AlertCircle,
  XCircle,
  Notebook,
  Globe,
  UserCog,
  UserCog2,
  UserPen
} from 'lucide-react';
import './Profile.css';
import { secureStorage } from '../../utils/secureStorage';
import { useScholar } from '../../hooks/useScholar';
import { useUploadProfileImage, useDeleteProfileImage } from "../../hooks/useProfile";
import { useLastWorkStatus } from "../../hooks/useWorkDetails";
import ImagePreviewModal from './ImagePreviewModal';


const Profile = () => {
  const [loading, setLoading] = useState(true);
  const [profileImage, setProfileImage] = useState(null);
  const [hoverImage, setHoverImage] = useState(false);
  const [hoverCamera, setHoverCamera] = useState(false);
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [, setScholarImage] = useState(null); // Your image state

  const handleImageView = () => {
    if (scholarImage) {
      setShowImagePreview(true);
    } else {
      // Open file picker if no image
      fileInputRef.current.click();
    }
  };
  const fileInputRef = useRef(null);

  const scholar = secureStorage.getScholar();
  const { data: scholarData } = useScholar();
  // console.log("SCholar data", scholar)
  // console.log("SCholar datafhdfhdfd", scholarData)

  const scholarImage = scholarData?.scholar_profile
    ? `http://scholarapi.seasense.in/${scholarData.scholar_profile}`
    : null;

  const [workProgress, setWorkProgress] = useState(0);

  const { data: lastStatus } = useLastWorkStatus();

  const lastWorkStatus = lastStatus?.status;

  useEffect(() => {
    if (lastWorkStatus !== undefined) {
      setWorkProgress(Number(lastWorkStatus) || 0);
    }
  }, [lastWorkStatus]);


  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreen = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkScreen();
    window.addEventListener("resize", checkScreen);

    return () => window.removeEventListener("resize", checkScreen);
  }, []);
  // Stats data
  const stats = [
    { icon: BookOpen, label: 'Publications', value: '8', change: '+2', color: '#3b82f6' },
    { icon: Award, label: 'Citations', value: '156', change: '+24', color: '#8b5cf6' },
    { icon: TrendingUp, label: 'Projects', value: '5', change: '+1', color: '#10b981' },
    { icon: Star, label: 'Rating', value: '4.8', change: '+0.3', color: '#f59e0b' }
  ];


  //   useEffect(() => {
  //     setTimeout(() => {
  //       setLoading(false);
  //     }, 1000);
  //   }, []);

  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  const { mutate: uploadImage } = useUploadProfileImage();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file) {
      const formData = new FormData();
      formData.append("scholar_profile", file);

      uploadImage(formData, {
        onSuccess: () => {
          e.target.value = "";
        }
      });
    }
  };
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDeleteImage = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    const formData = new FormData();
    formData.append("remove", 1);
    uploadImage(formData);
    setShowDeleteConfirm(false);
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
  };
  //   if (loading) {
  //     return (
  //       <div className="profile-premium">
  //         <div className="profile-loading">
  //           <div className="loading-spinner"></div>
  //           <p>Loading profile...</p>
  //         </div>
  //       </div>
  //     );
  //   }

  const capsLetter = (name) => {
    if (!name) return;
    return name.charAt(0).toUpperCase() + name.slice(1);
  }

  return (
    <div className="profile-premium">
      <div className="profile-limit">

        {/* Header Section */}
        <div className="profile-premium-header">
          <div>
            <h1>My Profile</h1>
            <p>View your academic and professional information</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="profile-premium-container">
          {/* Left Column - Profile Card */}
          <div className="profile-left-column">
            {/* Work Information */}
            <div className="info-premium-card">
              <div className="card-premium-header">
                <BriefcaseBusiness size={20} />
                <h3>Work Information</h3>
              </div>
              <div className="info-premium-grid">
                {/* <div className="info-premium-item">
                  <label>Date of Registration</label>
                  <div className="info-value">
                    <Calendar size={14} />
                    <span>{new Date(scholar?.reg_date).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric"
                    })}
                    </span>
                  </div>
                </div> */}
                <div className="info-premium-item">
                  <label>Domain</label>
                  <div className="info-value">
                    <Globe size={14} />
                    <span>{scholarData?.domain.domain}</span>
                  </div>
                </div>
                <div className="info-premium-item">
                  <label>Journal Index</label>
                  <div className="info-value">
                    <BookOpen size={14} />
                    <span>{scholarData?.journal_index.journal_index}</span>
                  </div>
                </div>


                <div className="info-premium-item">
                  <label>Technical Expert</label>
                  <div className="info-value">
                    <UserCog size={14} />
                    <span>{scholarData?.tech_expert.staff_name}</span>
                  </div>
                </div>
                <div className="info-premium-item">
                  <label>Technical Expert Contact</label>
                  <div className="info-value">
                    <Phone size={14} />
                    <span>+91 {scholarData?.tech_expert.staff_contact}</span>
                  </div>
                </div>
                <div className="info-premium-item">
                  <label>BDA Name</label>
                  <div className="info-value">
                    <Users size={14} />
                    <span>{scholarData?.bda.bda_name}</span>
                  </div>
                </div>
                <div className="info-premium-item">
                  <label>BDA Contact</label>
                  <div className="info-value">
                    <Phone size={14} />
                    <span>+91 {scholarData?.bda.bda_contact}</span>
                  </div>
                </div>
                <div className="info-premium-item full-width">
                  <label>Work Description</label>
                  <div className="info-value bio">
                    <Notebook size={14} />
                    <p>{scholar?.work_description}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="progress-premium-card">
              <div className="card-premium-header">
                <TrendingUp size={20} />
                <h3>Project Completion</h3>
                <span className="progress-percentage-badge">{workProgress}%</span>
              </div>
              <div className="progress-premium-bar">
                <div className="progress-premium-fill" style={{ width: `${workProgress}%` }}>
                  <div className="progress-premium-glow"></div>
                </div>
              </div>
              <div className="progress-premium-stats">
                {lastStatus?.note && (<>

                  <div className="progress-stat">
                    <Notebook size={14} />
                    <span>Notes:</span>
                    {capsLetter(lastStatus?.note)}
                  </div>
                  <div className="progress-stat">
                    <Calendar size={14} />
                    {/* <span>Remaining</span> */}
                    {new Date(lastStatus?.date).toLocaleString("en-GB", {
                      day: "2-digit",
                      month: 'short',
                      year: 'numeric'
                    })}
                  </div>
                </>)}
                {/* <div className="progress-stat">
                  <Clock size={14} />
                  <span>Remaining</span>
                 {100 - workProgress}
                </div> */}
              </div>
            </div>
          </div>

          {/* Right Column - Main Content */}
          <div className="profile-right-column">
            {/* Avatar Section with Hover Edit */}
            <div className="profile-avatar-card"
              onMouseEnter={() => setHoverCamera(true)}
              onMouseLeave={() => setHoverCamera(false)}
            >
              {/* {(hoverCamera || isMobile) && ( */}
              <div className="avatar-camera-wrapper">
                <div className="avatar-camera-btn"
                  onClick={handleImageClick}>
                  <Camera size={15} />
                </div>
                {scholarImage && (
                  <div className="avatar-delete-btn"
                    onClick={handleDeleteImage}
                  >
                    <Trash2 size={15} />
                  </div>
                )}

              </div>
              {/* )} */}
              <div
                className="avatar-premium-wrapper"
                onMouseEnter={() => setHoverImage(true)}
                onMouseLeave={() => setHoverImage(false)}
              >
                <div className="avatar-inner">
                  {scholarImage ? (
                    <img
                      src={scholarImage}
                      alt="Profile"
                      className="avatar-premium-image"
                      onClick={handleImageView}
                    />
                  ) : (
                    <div className="avatar-premium-placeholder">
                      <span>{scholar?.user_name?.charAt(0)}</span>
                    </div>
                  )}


                </div>


                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  accept=".png, .jpg, .jpeg"
                  style={{ display: "none" }}
                />
              </div>


              <h2>{scholar?.user_name}</h2>
              <p className="profile-role-premium">Scholar</p>
              <div className="profile-badge-premium">{scholar?.user_id}</div>

              {/* Social Links */}
              {/* <div className="social-links">
              <button className="social-btn">
                <FileText size={16} />
              </button>
              <button className="social-btn">
                <Github size={16} />
              </button>
              <button className="social-btn">
                <Twitter size={16} />
              </button>
            </div> */}
            </div>

            {/* Stats Grid */}
            {/* <div className="stats-premium-container">
            {stats.map((stat, index) => (
              <div key={index} className="stat-premium-item">
                <div className="stat-premium-icon" style={{ background: `${stat.color}15`, color: stat.color }}>
                  <stat.icon size={20} />
                </div>
                <div className="stat-premium-info">
                  <span className="stat-premium-value">{stat.value}</span>
                  <span className="stat-premium-label">{stat.label}</span>
                  <span className="stat-premium-change" style={{ color: stat.color }}>{stat.change}</span>
                </div>
              </div>
            ))}
          </div> */}

            {/* Contact Info */}
            <div className="contact-premium-card">
              <h3>Scholar Information</h3>
              <div className="contact-premium-list">
                <div className="contact-premium-item">
                  <Mail size={16} />
                  <span>{scholar?.email}</span>
                </div>
                <div className="contact-premium-item">
                  <Phone size={16} />
                  <span>{scholar?.contact}</span>
                </div>
                <div className="contact-premium-item">
                  <Calendar size={16} />
                  <span>{new Date(scholar?.reg_date).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric"
                  })} (Reg date)</span>
                </div>
                {/* <div className="contact-premium-item">
                  <MapPin size={16} />
                  <span>{scholar.address}</span>
                </div> */}
              </div>
            </div>

            {showDeleteConfirm && (
              <div className="modal-premium-overlay" onClick={cancelDelete}>
                <div className="confirmation-modal" onClick={(e) => e.stopPropagation()}>
                  <div className="confirmation-modal-header">
                    <AlertCircle size={24} color="#ef4444" />
                    <h3>Delete Profile Image</h3>
                    <button
                      className="modal-close-icon"
                      onClick={cancelDelete}
                      style={{
                        marginLeft: 'auto',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'var(--text-muted)'
                      }}
                    >
                      <XCircle size={20} />
                    </button>
                  </div>
                  <div className="confirmation-modal-body">
                    <p>Are you sure you want to delete your profile image?</p>
                    {/* <p className="warning-text">This action cannot be undone.</p> */}
                  </div>
                  <div className="confirmation-modal-footer">
                    <button className="confirmation-btn cancel" onClick={cancelDelete}>
                      Cancel
                    </button>
                    <button className="confirmation-btn delete" onClick={confirmDelete}>
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )}

            {showImagePreview && scholarImage && (
              <ImagePreviewModal
                imageUrl={scholarImage}
                onClose={() => setShowImagePreview(false)}
                onDelete={handleDeleteImage}
              />
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;