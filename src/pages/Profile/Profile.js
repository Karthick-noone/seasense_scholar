// Profile.js - Updated with Enhanced Loader
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
  UserPen,
  Contact,
  PhoneCall
} from 'lucide-react';
import './Profile.css';
import { secureStorage } from '../../utils/secureStorage';
import { useScholar } from '../../hooks/useScholar';
import { useUploadProfileImage, useDeleteProfileImage } from "../../hooks/useProfile";
import { useLastWorkStatus } from "../../hooks/useWorkDetails";
import ImagePreviewModal from './ImagePreviewModal';
import Loader from './../../components/Loader/Loader';
import { getAssetUrl } from '../../utils/getCompanyUrl';

const Profile = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [hoverImage, setHoverImage] = useState(false);
  const [hoverCamera, setHoverCamera] = useState(false);
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleImageView = () => {
    if (scholarImage) {
      setShowImagePreview(true);
    } else {
      fileInputRef.current.click();
    }
  };

  const fileInputRef = useRef(null);

  const scholar = secureStorage.getScholar();
  const { data: scholarData, isLoading: scholarLoading } = useScholar();
  const { data: lastStatus, isLoading: lastStatusLoading } = useLastWorkStatus();

  const scholarImage = scholarData?.scholar_profile
    ? getAssetUrl(scholarData.scholar_profile)
    : null;

  // console.log("Scholar Image", scholarImage)

  const [workProgress, setWorkProgress] = useState(0);
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

  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  const { mutate: uploadImage } = useUploadProfileImage();

  // Toast function
  const showToast = (message, type = 'error') => {
    const existingToast = document.querySelector('.custom-toast-notification');
    if (existingToast) {
      existingToast.remove();
    }

    const toast = document.createElement('div');
    toast.className = `custom-toast-notification ${type}`;

    let iconSvg = '';
    if (type === 'success') {
      iconSvg = '<path d="M20 6L9 17l-5-5" stroke="white" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>';
    } else if (type === 'error') {
      iconSvg = `
      <circle cx="12" cy="12" r="10" stroke="white" fill="none" stroke-width="2"/>
      <line x1="12" y1="8" x2="12" y2="12" stroke="white" stroke-width="2" stroke-linecap="round"/>
      <line x1="12" y1="16" x2="12.01" y2="16" stroke="white" stroke-width="2" stroke-linecap="round"/>
    `;
    }

    toast.innerHTML = `
    <div class="toast-content">
      <svg class="toast-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        ${iconSvg}
      </svg>
      <div class="toast-message-text">
        <strong>${type === 'success' ? 'Success!' : 'Error!'}</strong>
        <span>${message}</span>
      </div>
    </div>
    <div class="toast-progress-bar"></div>
  `;

    document.body.appendChild(toast);

    setTimeout(() => {
      if (toast && toast.parentNode) {
        toast.classList.add('fade-out');
        setTimeout(() => {
          if (toast && toast.parentNode) {
            toast.remove();
          }
        }, 300);
      }
    }, 4000);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      const fileSizeInMB = (file.size / (1024 * 1024)).toFixed(2);
      showToast(`File must be within 2 MB (selected: ${fileSizeInMB} MB)`, 'error');
      e.target.value = "";
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      showToast('Invalid file type! Please select JPEG, JPG, or PNG format.', 'error');
      e.target.value = "";
      return;
    }

    const formData = new FormData();
    formData.append("scholar_profile", file);
    setIsUploading(true)
    uploadImage(formData, {
      onSuccess: () => {
        e.target.value = "";
        showToast('Profile image uploaded successfully!', 'success');
        setIsUploading(false);

      },
      onError: (error) => {
        showToast('Failed to upload image. Please try again.', 'error');
        e.target.value = "";
        setIsUploading(false);

      }
    });
  };

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDeleteImage = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    const formData = new FormData();
    formData.append("remove", 1);
    setIsDeleting(true)
    uploadImage(formData, {
      onSuccess: () => {
        showToast('Profile image deleted successfully!', 'success');
        setShowDeleteConfirm(false);
        setIsDeleting(false)

      },
      onError: (error) => {
        showToast('Failed to delete image. Please try again.', 'error');
        setShowDeleteConfirm(false);
        setIsDeleting(false)

      }
    });
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setIsDeleting(false)
  };

  const capsLetter = (name) => {
    if (!name) return '';
    return name.charAt(0).toUpperCase() + name.slice(1);
  }

  if (scholarLoading) {
    return (
      <div className="dashboard-loader-wrapper">
        <Loader
          type="scholar"
          size="large"
          text="Loading profile data...."
        />
      </div>
    );
  }

  return (
    <div className="profile-premium">
      <div className="profile-limit">
        <div className='sticky-top-header'></div>

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
                <div className="info-premium-item">
                  <label>Domain</label>
                  <div className="info-value">
                    <Globe size={14} />
                    <span>{scholarData?.domain_nm || 'N/A'}</span>
                  </div>
                </div>
                <div className="info-premium-item">
                  <label>Journal Index</label>
                  <div className="info-value">
                    <BookOpen size={14} />
                    <span>{scholarData?.journal_index?.journal_index || 'N/A'}</span>
                  </div>
                </div>

                <div className="info-premium-item">
                  <label>Technical Expert</label>
                  <div className="info-value">
                    <UserCog size={14} />
                    <span>{scholarData?.tech_expert?.staff_name || 'N/A'}</span>
                  </div>
                </div>
                <div className="info-premium-item">
                  <label>Technical Expert Contact</label>
                  <div className="info-value">
                    <Phone size={14} />
                    <span> {scholarData?.tech_expert?.staff_contact || 'N/A'}</span>
                  </div>
                </div>
                <div className="info-premium-item">
                  <label>BDA Name</label>
                  <div className="info-value">
                    <Users size={14} />
                    <span>{scholarData?.bda?.bda_name || 'N/A'}</span>
                  </div>
                </div>
                <div className="info-premium-item">
                  <label>BDA Contact</label>
                  <div className="info-value">
                    <Phone size={14} />
                    <span> {scholarData?.bda?.bda_contact || 'N/A'}</span>
                  </div>
                </div>
                <div className="info-premium-item full-width">
                  <label>Work Description</label>
                  <div className="info-value bio">
                    <Notebook size={14} />
                    <p>{scholarData?.work_description || 'No work description available'}</p>
                  </div>
                </div>
              </div>
            </div>
            {workProgress > 0 && (
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
                  {lastStatus?.note && (
                    <div className="progress-stat">
                      {/* <Notebook size={14} className='progress-icon' /> */}
                      <span>Notes:</span>
                      <span>{capsLetter(lastStatus?.note)}</span>
                    </div>
                  )}
                  {lastStatus?.date && (
                    <div className="progress-stat progress-date">
                      {lastStatus?.date && !isNaN(new Date(lastStatus.date).getTime()) && (
                        <>
                          <Calendar size={14} />

                          <span>
                            {new Date(lastStatus.date).toLocaleString("en-GB", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Main Content */}
          <div className="profile-right-column">
            {/* Avatar Section with Hover Edit */}
            <div className="profile-avatar-card"
              onMouseEnter={() => setHoverCamera(true)}
              onMouseLeave={() => setHoverCamera(false)}
            >
              {(hoverCamera || isMobile) && scholarImage && (
                <div className="avatar-camera-wrapper">
                  <div className="avatar-delete-btn" onClick={handleDeleteImage}>
                    <Trash2 size={15} />
                  </div>
                </div>
              )}

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
                      <span>{scholarData?.user_name?.charAt(0) || 'S'}</span>
                    </div>
                  )}
                </div>

                <div className="avatar-camera-btn" onClick={handleImageClick} disabled={isUploading}>
                  {isUploading ? (
                    <span className='btn-loader'></span>
                  ) : (
                    <Camera size={15} />
                  )}
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  accept=".png, .jpg, .jpeg"
                  style={{ display: "none" }}
                  disabled={isUploading}
                />
              </div>

              <h2>{scholarData?.user_name || 'Scholar'}</h2>
              <p className="profile-role-premium">Scholar</p>
              <div className="profile-badge-premium">{scholarData?.user_id || 'Scholar Id'}</div>
            </div>

            {/* Contact Info */}
            <div className="contact-premium-card">
              <h3>Personal Information</h3>
              <div className="contact-premium-list">
                <div className="contact-premium-item">
                  <Mail size={16} />
                  <span>{scholarData?.email || 'N/A'}</span>
                </div>
                <div className="contact-premium-item">
                  <Phone size={16} />
                  <span>{scholar?.contact || 'N/A'}</span>
                </div>
                <div className="contact-premium-item">
                  <Calendar size={16} />
                  <span>
                    {scholar?.reg_date
                      ? new Date(scholar.reg_date).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric"
                      })
                      : 'N/A'} (Registration date)
                  </span>
                </div>
              </div>

              {scholarData?.secondary_emails?.length > 0 && (
                <>
                  <h3 style={{ marginTop: "15px" }}>Secondary Emails</h3>
                  <div className="contact-premium-list">
                    {scholarData.secondary_emails.map((email, index) => (
                      <div className="contact-premium-item" key={index}>
                        <Mail size={16} />
                        <span>{email}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {scholarData?.secondary_contacts?.length > 0 && (
                <>
                  <h3 style={{ marginTop: "15px" }}>Secondary Contacts</h3>
                  <div className="contact-premium-list">
                    {scholarData.secondary_contacts.map((email, index) => (
                      <div className="contact-premium-item" key={index}>
                        <PhoneCall size={16} />
                        <span>{email}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Delete Confirmation Modal */}
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
                  </div>
                  <div className="confirmation-modal-footer">
                    <button className="confirmation-btn cancel" onClick={cancelDelete}
                      disabled={isDeleting}
                    >
                      Cancel
                    </button>
                    <button
                      className="confirmation-btn delete"
                      onClick={confirmDelete}
                      disabled={isDeleting}
                    >
                      {isDeleting ? (
                        <span
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "8px"
                          }}
                        >
                          <span className="btn-loader"></span>
                          <span>Deleting...</span>
                        </span>
                      ) : (
                        "Delete"
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Image Preview Modal */}
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