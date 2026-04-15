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


const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [pendingPayment, setPendingPayment] = useState(0);
  const [totalPaid, setTotalPaid] = useState(0);

  const [selectedPeriod, setSelectedPeriod] = useState('weekly');

  const [workProgress, setWorkProgress] = useState(0);

  const scholar = secureStorage.getScholar();
  const { data: paymentData = [] } = usePayments();
  const payment = paymentData[0];

  const { data: apiResponse } = useComplaints(1, 10, 'all', '');

  const complaint = apiResponse?.data?.[0];

  // console.log("SCholor details", scholar)
  const company = secureStorage.getCompany();
  const { data: counts } = useComplaintCounts();

  const { data: work } = useWorkDetails();
  const workDetails = work?.[0];

  const workStatusList = workDetails?.work_dtls_sts || [];

  // console.log("Work details", workDetails)
  const { data: lastStatus } = useLastWorkStatus();

  const lastWorkStatus = lastStatus?.status;
  // console.log("lstWork details", lastWorkStatus)

  const [resolvedComplaints, setResolvedComplaints] = useState(0);
  const [pendingComplaints, setPendingComplaints] = useState(0);

  useEffect(() => {
    if (counts) {
      // console.log("Counts", counts);

      animateCount(setResolvedComplaints, counts.resolved || 0);
      animateCount(setPendingComplaints, counts.pending || 0);
    }
  }, [counts]);

  // const [resolvedComplaints, setResolvedComplaints] = useState(counts?.resolved);
  // const [pendingComplaints, setPendingComplaints] = useState(counts?.pending);
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const scholar = secureStorage.getScholar();
        if (!scholar?.id) return;

        const res = await getPaymentData(scholar.id);
        const response = res.data;

        const payment = response.data?.[0];

        setLoading(false);

        animateCount(setPendingPayment, Number(payment?.bal_amt) || 0);
        animateCount(setTotalPaid, Number(payment?.tot_paid) || 0);

        const total = Number(payment?.total_amount) || 0;
        const paid = Number(payment?.tot_paid) || 0;

        // const progress = total ? Math.round((paid / total) * 100) : 0;
        // animateProgress(Number(lastWorkStatus));

      } catch (err) {
        console.error("Dashboard API Error:", err);
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  useEffect(() => {
    if (lastWorkStatus !== undefined) {
      animateProgress(Number(lastWorkStatus) || 0);
    }
  }, [lastWorkStatus]);

  const progressRef = useRef(null);

  const animateProgress = (end) => {
    if (progressRef.current) {
      clearInterval(progressRef.current);
    }

    let progress = 0;

    progressRef.current = setInterval(() => {
      progress += 1;

      if (progress >= end) {
        setWorkProgress(end);
        clearInterval(progressRef.current);
      } else {
        setWorkProgress(progress);
      }
    }, 10);
  };

  const animateCount = (setValue, end, duration = 1000) => {
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
  };
  // Stats Cards Data
  const statsCards = [
    {
      icon: CheckCircle,
      label: 'Total Paid',
      value: `₹${totalPaid.toLocaleString()}`,
      change: '+8.2%',
      trend: 'up',
      color: '#10b981',
      bgColor: 'rgba(16, 185, 129, 0.1)'
    },
    {
      icon: IndianRupee,
      label: 'Pending Payment',
      value: pendingPayment === 0
        ? 'No pending payment'
        : `₹${pendingPayment.toLocaleString()}`,
      change: '+12.5%',
      trend: 'up',
      color: '#f59e0b',
      bgColor: 'rgba(245, 158, 11, 0.1)',
      isZero: pendingPayment === 0
    },
    {
      icon: ThumbsUp,
      label: 'Resolved Complaints',
      value: resolvedComplaints,
      // value: 10,
      change: '+15%',
      trend: 'up',
      color: '#8b5cf6',
      bgColor: 'rgba(139, 92, 246, 0.1)'
    },
    {
      icon: AlertCircle,
      label: 'Pending Complaints',
      // value: 10,
      value: pendingComplaints,
      change: '-25%',
      trend: 'down',
      color: '#ef4444',
      bgColor: 'rgba(239, 68, 68, 0.1)'
    },
  ];

  // Chart Data
  const weeklyData = [32000, 45000, 28000, 52000, 48000, 61000, 55000];
  const monthlyData = [125000, 148000, 162000, 189000, 205000, 228000];
  const labels = weeklyData.map((_, i) => ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]);

  const maxValue = Math.max(...(selectedPeriod === 'weekly' ? weeklyData : monthlyData));
  const chartData = selectedPeriod === 'weekly' ? weeklyData : monthlyData;
  const chartLabels = selectedPeriod === 'weekly' ? labels : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

  // Recent Activities
  const recentActivities = [
    // Payment (only if exists)
    ...(payment
      ? [{
        id: 1,
        activity: `Payment Paid for ${payment?.purpose?.pay_purpose || ''}`,
        date: new Date(payment?.pay_dt_tm).toLocaleString("en-GB", {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        }),
        status: payment?.pay_status,
        amount: payment?.pay_received || 0
      }]
      : []),

    // Complaint (ONLY if exists)
    ...(complaint?.complaint
      ? [{
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
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        }),
        status:
          complaint?.resolve_status === "resolved" && complaint?.reply_content
            ? 'Resolved'
            : complaint?.resolve_status === null && complaint?.reply_content
              ? 'In Progress'
              : 'Pending',
        complaint: complaint?.complaint
      }]
      : [])
  ];

  // Upcoming Deadlines
  // const deadlines = [
  //   { task: 'Submit Phase 2 Report', date: 'Dec 15, 2024', daysLeft: 5, priority: 'high' },
  //   { task: 'Final Payment Due', date: 'Dec 20, 2024', daysLeft: 10, priority: 'medium' },
  //   { task: 'Project Completion', date: 'Dec 30, 2024', daysLeft: 20, priority: 'low' },
  // ];

  const getDaysLeft = (deadline) => {
    if (!deadline) return 0;

    const today = new Date();
    const endDate = new Date(deadline);

    // remove time part
    today.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);

    const diffTime = endDate - today;

    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const daysLeft = getDaysLeft(workDetails?.scholar?.work_dl_on);
  const getPriorityColor = (daysLeft) => {
    if (daysLeft < 0) return '#ef4444';      // overdue → red
    if (daysLeft <= 3) return '#f59e0b';     // near → orange
    return '#10b981';                        // safe → green
  };

  // if (loading) {
  //   return (
  //     <div className="dashboard-premium">
  //       <div className="dashboard-loading">
  //         <div className="loading-spinner"></div>
  //         <p>Loading dashboard...</p>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="dashboard-premium">
      <div className="dashboard-limit">
        {/* Header Section */}
        <div className="dashboard-premium-header">
          <div className="header-left">
            <h1>Welcome back, {scholar.user_name || 'Scholar'}!</h1>
            <p>{company.company_name || "Sea Sense Interdisciplinary Research and IT Solution (OPC) Pvt.Ltd."}</p>
          </div>
          {/* <div className="header-right">
          <button className="header-btn">
            <Download size={18} />
            Export Report
          </button>
          <button className="header-btn icon-only">
            <RefreshCw size={18} />
          </button>
        </div> */}
        </div>



        {/* Charts Section */}
        <div className="charts-premium-grid">

          <div className="stats-premium-grid">
            {statsCards.map((stat, index) => (
              <div
                key={index}
                className={`stat-premium-card ${stat.isZero ? "center-content" : ""}`}
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
                    <div className="stat-premium-value">{stat.value}</div>

                    {!stat.isZero && (
                      <div className="stat-premium-label">{stat.label}</div>
                    )}
                  </div>

                </div>
              </div>
            ))}
          </div>
          {/* Progress Circle */}
          <div className="chart-premium-card">
            <div className="chart-header">
              <div>
                <h3>Work Completion</h3>
                <p>Overall project progress</p>
              </div>
              <div className="progress-badge"><TrendingUp size={20} /></div>
            </div>
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
                    stroke="var(--primary-color)"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 54}`}
                    strokeDashoffset={`${2 * Math.PI * 54 * (1 - workProgress / 100)}`}
                    transform="rotate(-90 60 60)"
                    className="progress-ring-circle"
                  />
                </svg>
                <div className="circle-progress-text">
                  <span className="percentage">{workProgress}%</span>
                  <span className="label">Complete</span>
                </div>
              </div>

              <div className="progress-stats">
                <div className="stats-header">
                  <span>Date</span>
                  <span>Progress</span>
                </div>

                {/* Check if data exists and display last 3 items */}
                {workStatusList && workStatusList.length > 0 ? (
                  <>
                    {/* Display only last 3 stats */}
                    {workStatusList.slice(0, -1).map((item, index) => (
                      <div key={index} className="stat-row-graph">
                        <span className="stat-date">
                          {new Date(item.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
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
                        </div>
                      </div>
                    ))}
                  </>
                ) : (
                  /* Empty State - No Data Available */
                  <div className="empty-progress-stats">
                    <div className="empty-icon">
                      <TrendingUp size={32} />
                    </div>
                    <p className="empty-title">Work progress data not available</p>
                    <p className="empty-description">Work status updates will appear here once available</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="bottom-premium-grid">
          <div className="activity-premium-card">
            <div className="card-header">
              <h3>Recent Activities</h3>
              {/* <button className="view-all-btn">View All</button> */}
            </div>
            <div className="activity-timeline">
              {recentActivities.map((activity, index) => (
                <div key={activity.id} className="timeline-item">

                  <div className={`timeline-dot ${activity.status}`}></div>

                  {index !== recentActivities.length - 1 && (
                    <div className="timeline-line"></div>
                  )}

                  <div className="timeline-content">
                    <p className="activity-title">{activity.activity}</p>

                    <div className="activity-footer">
                      {activity.amount && (
                        <span className="activity-amount">₹{activity.amount}</span>
                      )}

                      {activity.complaint && (
                        <span className="activity-complaint">{activity.complaint}</span>
                      )}

                      <span className="activity-date">{activity.date || ''}</span>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          </div>

          <div className="deadlines-premium-card">
            <div className="card-header">
              <h3>{(workDetails?.scholar?.work_dl_on) ?  " Upcoming Deadlines " : "Work Description"}</h3>
              <Calendar size={18} className="header-icon" />
            </div>
            <div className="deadlines-list">
              {/* {deadlines.map((deadline, index) => ( */}
              <div className="deadline-item">
                <div
                  className="deadline-priority"
                  style={{ background: getPriorityColor(daysLeft) }}
                ></div>
                <div className="deadline-info">
                  <div className="deadline-task">{scholar?.work_description}</div>
                  {workDetails?.scholar?.work_dl_on && (
                  <div className="deadline-date">{new Date(workDetails?.scholar?.work_dl_on).toLocaleDateString("en-GB", {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                  })}</div>
                )}
                </div>
                {workDetails?.scholar?.work_dl_on && (
                <div
                  className="deadline-days"
                  style={{ color: getPriorityColor(workDetails?.priority) }}
                >
                  {daysLeft > 0
                    ? `${daysLeft} days left`
                    : daysLeft === 0
                      ? "Due today"
                      : `${Math.abs(daysLeft)} days overdue`}
                </div>
                )}
              </div>
              {/* ))} */}
            </div>
            <div className="payment-summary-mini">
              <div className="summary-row">
                <span>Total Project Value</span>
                <strong>₹{(totalPaid + pendingPayment).toLocaleString()}</strong>
              </div>
              <div className="summary-row">
                <span>Payment Progress</span>
                <strong>{Math.round((totalPaid / (totalPaid + pendingPayment)) * 100)}%</strong>
              </div>
              <div className="payment-bar-mini">
                <div
                  className="payment-fill-mini"
                  style={{ width: `${(totalPaid / (totalPaid + pendingPayment)) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* <div className="actions-premium-card">
          <div className="card-header">
            <h3>Quick Actions</h3>
          </div>
          <div className="actions-premium-grid">
            <button className="action-premium-btn">
              <BookOpen size={20} />
              <span>Start Learning</span>
            </button>
            <button className="action-premium-btn">
              <Calendar size={20} />
              <span>Schedule Meeting</span>
            </button>
            <button className="action-premium-btn">
              <TrendingUp size={20} />
              <span>View Progress</span>
            </button>
            <button className="action-premium-btn">
              <Users size={20} />
              <span>Study Group</span>
            </button>
          </div>
        </div> */}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;