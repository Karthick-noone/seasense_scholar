// Dashboard.js - Fixed with proper animation timing
import React, { useState, useEffect, useRef } from 'react';
import {
  BookOpen,
  Award,
  Clock,
  CheckCircle,
  TrendingUp,
  Calendar,
  Users,
  DollarSign,
  AlertCircle,
  ThumbsUp,
  Clock as ClockIcon,
  IndianRupee,
  BarChart3,
  PieChart,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  MoreVertical,
  Download,
  RefreshCw
} from 'lucide-react';
import './Dashboard.css';
import { secureStorage } from '../../utils/secureStorage';
import { getPaymentData } from '../../services/paymentService';
import { useComplaintCounts, useComplaints } from '../../hooks/useComplaints';
import { usePayments } from '../../hooks/usePayments';
import { useWorkDetails, useLastWorkStatus } from "../../hooks/useWorkDetails";
import { useScholar } from '../../hooks/useScholar';
import { Link } from 'react-router-dom';
import Loader from './../../components/Loader/Loader';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [pendingPayment, setPendingPayment] = useState(0);
  const [totalPaid, setTotalPaid] = useState(0);
  const [selectedPeriod, setSelectedPeriod] = useState('weekly');
  const [workProgress, setWorkProgress] = useState(0);
  const [isDataReady, setIsDataReady] = useState(false);

  // Store actual values for animation targets
  const [targetPendingPayment, setTargetPendingPayment] = useState(0);
  const [targetTotalPaid, setTargetTotalPaid] = useState(0);
  const [targetResolvedComplaints, setTargetResolvedComplaints] = useState(0);
  const [targetPendingComplaints, setTargetPendingComplaints] = useState(0);
  const [targetWorkProgress, setTargetWorkProgress] = useState(0);

  const scholar = secureStorage.getScholar();
  const { data: paymentData = [] } = usePayments();
  const payment = paymentData[0];

  const { data: apiResponse } = useComplaints(1, 10, 'all', '');
  const complaint = apiResponse?.data?.[0];

  const company = secureStorage.getCompany();
  const { data: counts } = useComplaintCounts();

  const { data: work } = useWorkDetails();
  const workDetails = work?.[0];
  const workStatusList = workDetails?.work_dtls_sts || [];

  const { data: lastStatus } = useLastWorkStatus();
  const lastWorkStatus = lastStatus?.status;
  const lastWorkStatusDate = lastStatus?.date;
  const lastWorkStatusNote = lastStatus?.note;

  const [resolvedComplaints, setResolvedComplaints] = useState(0);
  const [pendingComplaints, setPendingComplaints] = useState(0);

  const { data: companyData } = useScholar();

  // Track data loading states
  const [dataStates, setDataStates] = useState({
    paymentsLoaded: false,
    complaintsLoaded: false,
    workLoaded: false,
    countsLoaded: false,
    scholarLoaded: false
  });

  // Set target values when data arrives
  useEffect(() => {
    if (counts) {
      setTargetResolvedComplaints(counts.resolved || 0);
      setTargetPendingComplaints(counts.pending || 0);
      setDataStates(prev => ({ ...prev, countsLoaded: true }));
    }
  }, [counts]);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const scholarData = secureStorage.getScholar();
        if (!scholarData?.id) {
          setLoading(false);
          return;
        }

        const res = await getPaymentData(scholarData.id);
        const response = res.data;
        const paymentDataFromApi = response.data?.[0];

        setTargetPendingPayment(Number(paymentDataFromApi?.bal_amt) || 0);
        setTargetTotalPaid(Number(paymentDataFromApi?.tot_paid) || 0);

        setDataStates(prev => ({ ...prev, paymentsLoaded: true }));
      } catch (err) {
        console.error("Dashboard API Error:", err);
        setDataStates(prev => ({ ...prev, paymentsLoaded: true }));
      }
    };

    fetchDashboard();
  }, []);

  // Set target work progress when data arrives
  useEffect(() => {
    if (lastWorkStatus !== undefined) {
      setTargetWorkProgress(Number(lastWorkStatus) || 0);
      setDataStates(prev => ({ ...prev, workLoaded: true }));
    }
  }, [lastWorkStatus]);

  // Track other data loading states
  useEffect(() => {
    if (apiResponse !== undefined) {
      setDataStates(prev => ({ ...prev, complaintsLoaded: true }));
    }
  }, [apiResponse]);

  useEffect(() => {
    if (work !== undefined) {
      setDataStates(prev => ({ ...prev, workLoaded: true }));
    }
  }, [work]);

  useEffect(() => {
    if (companyData !== undefined) {
      setDataStates(prev => ({ ...prev, scholarLoaded: true }));
    }
  }, [companyData]);

  // Check when all data is loaded and start animations
  useEffect(() => {
    const allDataLoaded =
      dataStates.paymentsLoaded &&
      dataStates.complaintsLoaded &&
      dataStates.workLoaded &&
      dataStates.countsLoaded &&
      dataStates.scholarLoaded;

    if (allDataLoaded && !isDataReady) {
      // First hide the loader
      setLoading(false);
      setIsDataReady(true);

      // Small delay to ensure DOM is ready, then start animations
      setTimeout(() => {
        // Animate counts
        animateCount(setResolvedComplaints, targetResolvedComplaints, 1200);
        animateCount(setPendingComplaints, targetPendingComplaints, 1200);
        animateCount(setTotalPaid, targetTotalPaid, 1200);
        animateCount(setPendingPayment, targetPendingPayment, 1200);

        // Animate progress bar
        animateProgress(targetWorkProgress);
      }, 100);
    }
  }, [dataStates, isDataReady, targetResolvedComplaints, targetPendingComplaints, targetTotalPaid, targetPendingPayment, targetWorkProgress]);

  const progressRef = useRef(null);
  const countRefs = useRef({
    resolved: null,
    pending: null,
    totalPaid: null,
    pendingPayment: null
  });

  const animateProgress = (end) => {
    if (progressRef.current) {
      clearInterval(progressRef.current);
    }

    let progress = 0;
    const stepTime = 16; // ~60fps
    const duration = 1000; // 1 second for progress bar
    const increment = end / (duration / stepTime);

    progressRef.current = setInterval(() => {
      progress += increment;
      if (progress >= end) {
        setWorkProgress(end);
        clearInterval(progressRef.current);
        progressRef.current = null;
      } else {
        setWorkProgress(Math.floor(progress));
      }
    }, stepTime);
  };

  const animateCount = (setValue, end, duration = 1200) => {
    let start = 0;
    const stepTime = 16;
    const increment = end / (duration / stepTime);

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setValue(end);
        clearInterval(timer);
      } else {
        setValue(Math.floor(start));
      }
    }, stepTime);

    return timer;
  };


  const statsCards = [
    {
      icon: CheckCircle,
      label: 'Total Paid',
      value: `₹${totalPaid.toLocaleString()}`,
      color: '#10b981',
      bgColor: 'rgba(16, 185, 129, 0.1)',
      path: '/payment-history'
    },
    {
      icon: IndianRupee,
      label: 'Pending Payment',
      value: pendingPayment === 0 ? 'No pending payment' : `₹${pendingPayment}`,
      color: '#f59e0b',
      bgColor: 'rgba(245, 158, 11, 0.1)',
      isZero: pendingPayment === 0,
      path: '/payment-history'
    },
    {
      icon: ThumbsUp,
      label: 'Resolved Complaints',
      value: resolvedComplaints,
      color: '#8b5cf6',
      bgColor: 'rgba(139, 92, 246, 0.1)',
      path: '/complaint-register',
      status: "resolved"
    },
    {
      icon: AlertCircle,
      label: 'Pending Complaints',
      value: pendingComplaints === 0 ? 'No pending complaints' : pendingComplaints,
      color: '#ef4444',
      bgColor: 'rgba(239, 68, 68, 0.1)',
      isZero: pendingComplaints === 0,
      path: '/complaint-register',
      status: "pending"
    },
  ];

  const weeklyData = [32000, 45000, 28000, 52000, 48000, 61000, 55000];
  const monthlyData = [125000, 148000, 162000, 189000, 205000, 228000];
  const labels = weeklyData.map((_, i) => ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]);

  const recentActivities = [
    ...(payment ? [{
      id: 1,
      activity: `Payment Paid for ${payment?.purpose?.pay_purpose || ''}`,
      date: new Date(payment?.pay_dt_tm).toLocaleString("en-GB", {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
      status: payment?.pay_status,
      amount: payment?.pay_received || 0
    }] : []),
    ...(complaint?.complaint ? [{
      id: 2,
      activity: `Complaint ${complaint?.resolve_status === "resolved" && complaint?.reply_content
        ? 'Resolved'
        : complaint?.resolve_status === null && !complaint?.reply_content
          ? 'Pending'
          : 'In-Progress'
        } - Last Submission`,
      date: new Date(complaint?.complt_reg_dt).toLocaleString("en-GB", {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
      status: complaint?.resolve_status === "resolved" && complaint?.reply_content
        ? 'Resolved'
        : complaint?.resolve_status === null && complaint?.reply_content
          ? 'In Progress'
          : 'Pending',
      complaint: complaint?.complaint
    }] : [])
  ];

  const getDaysLeft = (deadline) => {
    if (!deadline) return 0;
    const today = new Date();
    const endDate = new Date(deadline);
    today.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);
    const diffTime = endDate - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const daysLeft = getDaysLeft(workDetails?.scholar?.work_dl_on);

  const getPriorityColor = (daysLeft) => {
    if (daysLeft < 0) return '#ef4444';
    if (daysLeft <= 3) return '#f59e0b';
    return '#10b981';
  };

  const getShortDescription = (description) => {
    if (!description) return '';
    if (description.length <= 30) return description;
    const trimmed = description.substring(0, 55);
    if (!trimmed.includes(' ')) {
      return trimmed + '...';
    }
    return trimmed.substring(0, trimmed.lastIndexOf(' ')) + '...';
  };

  const statusClass = complaint?.status?.toLowerCase().replace(/\s+/g, '-');
  const getStatusClass = (status) => status?.toLowerCase().replace(/\s+/g, '-');

  // Show inline loader while data is being fetched (not full page)
  if (loading) {
    return (
      <div className="dashboard-loader-wrapper">
        <Loader
          type="scholar"
          size="large"
          text="Loading dashboard data...."
        />
      </div>
    );
  }

  return (
    <div className="dashboard-premium">
      <div className="dashboard-limit">
        <div className='sticky-top-header'></div>
        <div className="dashboard-premium-header">
          <div className="header-left">
            <h1>Welcome, {companyData?.user_name || 'Scholar'}!</h1>
            <p>{companyData?.company?.company_name || "Sea Sense Interdisciplinary Research and IT Solution (OPC) Pvt.Ltd."}</p>
          </div>
        </div>

        <div className="charts-premium-grid">
          <div className="stats-premium-grid">
            {statsCards.map((stat, index) => {
              const CardContent = (
                <div
                  className={`stat-premium-card ${stat.isZero ? "center-content" : ""} ${stat.isZero ? "disabled-card" : ""}`}
                >
                  <div className="stat-premium-header">
                    {!stat.isZero && (
                      <div
                        className="stat-premium-icon"
                        style={{ background: stat.bgColor, color: stat.color }}
                      >
                        <stat.icon size={22} />
                      </div>
                    )}
                    <div>
                      <div
                        className="stat-premium-value"
                        style={{
                          fontSize: stat.isZero ? "14px" : "",
                          textAlign: stat.isZero ? "center" : ""
                        }}
                      >
                        {stat.value}
                      </div>
                      {!stat.isZero && (
                        <div className="dashboard-stat-premium-label">
                          {stat.label}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );

              return stat.isZero ? (
                <div key={index}>{CardContent}</div>
              ) : (
                <Link
                  key={index}
                  to={stat.path}
                  state={{ status: stat.status }}
                  style={{ textDecoration: "none" }}
                >
                  {CardContent}
                </Link>
              );
            })}
          </div>

          <div className="chart-premium-card">
            <div className="chart-header">
              <div>
                <h3>Work Completion</h3>
                <p>Overall project progress</p>
              </div>
              <div className="progress-badge"><TrendingUp size={20} /></div>
            </div>
            {workProgress > 0 ? (
              <div className="circle-progress-container">
                <div className="circle-progress">
                  <svg viewBox="0 0 120 120" className="progress-ring">
                    <circle
                      cx="60"
                      cy="60"
                      r="54"
                      fill="none"
                      stroke="var(--border-color)"
                      strokeWidth="8"
                    />

                    <circle
                      cx="60"
                      cy="60"
                      r="54"
                      fill="none"
                      stroke={workProgress === 100 ? "#10b981" : "var(--primary-color)"}
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 54}`}
                      strokeDashoffset={`${2 * Math.PI * 54 * (1 - workProgress / 100)}`}
                      transform="rotate(-90 60 60)"
                      className="progress-ring-circle"
                    />
                  </svg>

                  <div className="circle-progress-text">
                    <span
                      className={`percentage ${workProgress === 100 ? "completed" : ""}`}
                    >
                      {workProgress}%
                    </span>

                    <span className="label">
                      {lastWorkStatusDate &&
                        !isNaN(new Date(lastWorkStatusDate).getTime())
                        ? new Date(lastWorkStatusDate).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })
                        : ""}
                    </span>

                    <span className="completed-note">
                      {workProgress === 100 ? "Completed" : ""}
                    </span>
                  </div>
                </div>
                {workStatusList && workStatusList.length > 1 && (
                  <div className="progress-stats">
                    <div className="stats-header">
                      <span>Date</span>
                      <span>Progress</span>
                    </div>
                    {workStatusList && workStatusList.length > 1 ? (
                      workStatusList.slice(-4, -1).map((item, index) => (
                        <div key={index} className="stat-row-graph">
                          <span className="stat-date">
                            {new Date(item.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: "numeric" })}
                          </span>
                          <div className="stat-bar-container">
                            <div
                              className="stat-bar-fill"
                              style={{
                                width: `${item.status}%`,
                                backgroundColor: item.status >= 70 ? '#10b981' : item.status >= 40 ? '#f59e0b' : '#ef4444'
                              }}
                            >
                              <span className="stat-bar-label">{item.status}%</span>
                            </div>
                            <span>{item.note}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="empty-progress-stats">
                        <div className="empty-icon"><TrendingUp size={32} /></div>
                        <p className="empty-title">Work progress data not available</p>
                        <p className="empty-description">Work status updates will appear here once available</p>
                      </div>
                    )}
                  </div>
                )}
              </div>) : (
              <div className="empty-progress-stats">
                <div className="empty-icon"><TrendingUp size={32} /></div>
                <p className="empty-title">Work progress data not available</p>
                <p className="empty-description">Work status updates will appear here once available</p>
              </div>
            )}
          </div>
        </div>

        <div className="bottom-premium-grid">
          <div className="activity-premium-card">
            <div className="card-header">
              <h3>Recent Activities</h3>
            </div>
            <div className="activity-timeline">
              {recentActivities.map((activity, index) => (
                <div key={activity.id} className="timeline-item">
                  <div className={`timeline-dot ${getStatusClass(activity.status)}`}></div>
                  {index !== recentActivities.length - 1 && <div className="timeline-line"></div>}
                  <div className="timeline-content">
                    <p className="activity-title">{activity.activity}</p>
                    <div className="activity-footer">
                      {activity.amount && <span className="activity-amount">₹{activity.amount}</span>}
                      {activity.complaint && (
                        <span className={`activity-complaint-${statusClass}`} title={activity.complaint}>
                          {getShortDescription(activity.complaint)}
                        </span>
                      )}
                      <span className="activity-date">{activity.date || ''}</span>
                    </div>
                  </div>
                </div>
              ))}
              {recentActivities.length === 0 && (
                <div className="no-activities">
                  <p>No recent activities</p>
                </div>
              )}
            </div>
          </div>

          <div className="deadlines-premium-card">
            {/* <div className="card-header">
              <h3>{workDetails?.scholar?.work_dl_on ? "Upcoming Deadlines" : "Work Description"}</h3>
            </div>
            <div className="deadlines-list">
              <div className="deadline-item">
                <div className="deadline-priority" style={{ background: getPriorityColor(daysLeft) }}></div>
                <div className="deadline-info">
                  <div className="deadline-task">{scholar?.work_description || "No work description available"}</div>
                  {workDetails?.scholar?.work_dl_on && (
                    <div className="deadline-date">
                      {new Date(workDetails?.scholar?.work_dl_on).toLocaleDateString("en-GB", {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </div>
                  )}
                </div>
                {workDetails?.scholar?.work_dl_on && (
                  <div className="deadline-days" style={{ color: getPriorityColor(workDetails?.priority || daysLeft) }}>
                    {daysLeft > 0
                      ? `${daysLeft} ${daysLeft > 1 ? "days" : "day"} left`
                      : daysLeft === 0
                        ? "Due today"
                        : `${Math.abs(daysLeft)} ${Math.abs(daysLeft) > 1 ? "days" : "day"} overdue`}
                  </div>
                )}
              </div>
            </div> */}
            <div className="card-header">
              <h3>Payment Status</h3>
            </div>
            <div className="payment-summary-mini">
              <div className="summary-row">
                <span>Total Amount</span>
                <strong>₹{((totalPaid || 0) + (pendingPayment || 0)).toLocaleString()}</strong>
              </div>
              <div className="summary-row">
                <span>Pending Amount</span>
                <strong>₹{((pendingPayment || 0)).toLocaleString()}</strong>
              </div>
              <div className="summary-row">
                <span>Payment Progress</span>
                <strong>{Math.round(((totalPaid || 0) / ((totalPaid || 0) + (pendingPayment || 0))) * 100) || 0}%</strong>
              </div>
              <div className="payment-bar-mini">
                <div
                  className="payment-fill-mini"
                  style={{ width: `${((totalPaid || 0) / ((totalPaid || 0) + (pendingPayment || 0))) * 100 || 0}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;