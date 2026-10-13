import axios from 'axios';

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  '';

export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000,
  headers: {
    'Content-Type': 'application/json',
  },
});

let mockPendingDonationRecords: any[] = [
  {
    id: "rec_pend_001",
    acceptanceId: "acc_001",
    donorId: "donor_101",
    donorName: "Dawit Bekele",
    shortId: "DON-4081",
    donor: {
      id: "donor_101",
      name: "Dawit Bekele",
      shortId: "DON-4081",
      bloodType: "O-",
      phone: "+251 91 144 8822"
    },
    requestId: "req_881",
    request: {
      id: "req_881",
      bloodType: "O-",
      requestType: "Emergency",
      isEmergency: true,
      description: "Emergency O- Blood Request for ICU Trauma Unit",
      createdAt: new Date(Date.now() - 3600000 * 5).toISOString()
    },
    requestDescription: "Emergency O- Blood Request for ICU Trauma Unit",
    requestBloodType: "O-",
    acceptedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString()
  },
  {
    id: "rec_pend_002",
    acceptanceId: "acc_002",
    donorId: "donor_102",
    donorName: "Selamawit Tadesse",
    shortId: "DON-7192",
    donor: {
      id: "donor_102",
      name: "Selamawit Tadesse",
      shortId: "DON-7192",
      bloodType: "A+",
      phone: "+251 92 333 5511"
    },
    requestId: "req_882",
    request: {
      id: "req_882",
      bloodType: "A+",
      requestType: "Normal",
      isEmergency: false,
      description: "Scheduled Surgery Blood Reserve Request",
      createdAt: new Date(Date.now() - 3600000 * 3).toISOString()
    },
    requestDescription: "Scheduled Surgery Blood Reserve Request",
    requestBloodType: "A+",
    acceptedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
  },
  {
    id: "rec_pend_003",
    acceptanceId: "acc_003",
    donorId: "donor_103",
    donorName: "Henok Girma",
    shortId: "DON-2350",
    donor: {
      id: "donor_103",
      name: "Henok Girma",
      shortId: "DON-2350",
      bloodType: "B+",
      phone: "+251 93 777 9900"
    },
    requestId: "req_883",
    request: {
      id: "req_883",
      bloodType: "B+",
      requestType: "Emergency",
      isEmergency: true,
      description: "Urgent B+ Pediatric Ward Replacement",
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
    },
    requestDescription: "Urgent B+ Pediatric Ward Replacement",
    requestBloodType: "B+",
    acceptedAt: new Date(Date.now() - 3600000 * 1).toISOString(),
    createdAt: new Date(Date.now() - 3600000 * 1).toISOString()
  }
];

axiosInstance.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem('token') ||
      localStorage.getItem('auth_token') ||
      sessionStorage.getItem('token') ||
      sessionStorage.getItem('auth_token');

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // --- TEMPORARY MOCK ---
    if (config.url?.includes('/api/auth/login')) {
      let email = '';
      try {
        const payload = typeof config.data === 'string' ? JSON.parse(config.data) : config.data;
        email = (payload?.email || '').toLowerCase();
      } catch {
        email = '';
      }

      const isAdmin = email.includes('admin');
      const isSuperAdmin = email.includes('superadmin') || email === 'admin@legash.com';

      if (isAdmin) {
        return Promise.reject({
          isMock: true,
          data: {
            success: true,
            token: "mock_admin_token_123",
            role: isSuperAdmin ? "superadmin" : "admin",
            permissions: { canApproveHospitals: true, canPostEvents: true },
            user: {
              id: isSuperAdmin ? "superadmin_id" : "admin_id",
              name: isSuperAdmin ? "Mock Super Admin" : "Mock Staff Admin",
              email: email || "admin@legash.com"
            }
          }
        });
      }

      // Default: Hospital User login
      return Promise.reject({
        isMock: true,
        data: {
          success: true,
          token: "mock_hospital_token_123",
          role: "hospital",
          user: {
            id: "hosp_user_01",
            name: "Addis General Hospital",
            email: email || "contact@hospital.org"
          },
          hospital: {
            id: "hosp_user_01",
            name: "Addis General Hospital",
            hospitalName: "Addis General Hospital",
            email: email || "contact@hospital.org",
            phone: "+251 91 123 4567",
            licenseNumber: "LIC-ETH-2024-9988"
          }
        }
      });
    }

    if (config.url?.includes('/api/superadmin/hospitals/stock')) {
      return Promise.reject({
        isMock: true,
        data: { success: true, data: [
          { hospitalName: 'Addis Ababa Central Hospital', location: { address: 'Addis Ababa, Ethiopia' }, phone: '+251911234567', bloodType: 'A+', availableUnits: 45 },
          { hospitalName: 'St. Pauls Hospital Millennium', location: { address: 'Addis Ababa, Ethiopia' }, phone: '+251922345678', bloodType: 'B+', availableUnits: 30 }
        ]}
      });
    }

    if (config.url?.includes('/api/superadmin/analytics/hospitals')) {
      return Promise.reject({
        isMock: true,
        data: {
          success: true,
          data: {
            nationalTotals: { 'A+': 450, 'A-': 120, 'B+': 320, 'B-': 90, 'AB+': 180, 'AB-': 40, 'O+': 890, 'O-': 210 },
            topHospitals: [{ hospitalName: 'Black Lion Hospital', totalUnits: 1200 }],
            bottomHospitals: [{ hospitalName: 'Rural Clinic A', totalUnits: 5 }],
            trends: [
              { date: 'Oct 01', 'A+': 400, 'O+': 800, 'B+': 300 },
              { date: 'Oct 02', 'A+': 420, 'O+': 850, 'B+': 310 }
            ]
          }
        }
      });
    }

    if (config.url?.includes('/api/superadmin/hospitals/pending')) {
      return Promise.reject({
        isMock: true,
        data: {
          success: true,
          hospitals: [
            {
              id: "hosp_101",
              hospitalName: "Tikur Anbessa Specialized Hospital",
              licenseNumber: "MED-ETH-2024-8841",
              email: "contact@tikuranbessa.gov.et",
              phone: "+251 11 551 1211",
              createdAt: new Date().toISOString(),
              location: { address: "Addis Ababa, Lideta Sub City", lat: 9.0142, lng: 38.7485 }
            },
            {
              id: "hosp_102",
              hospitalName: "St. Paul's Hospital Millennium Medical College",
              licenseNumber: "MED-ETH-2023-4519",
              email: "info@sphmmc.edu.et",
              phone: "+251 11 275 0125",
              createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
              location: { address: "Addis Ababa, Gulele Sub City", lat: 9.0578, lng: 38.7369 }
            },
            {
              id: "hosp_103",
              hospitalName: "Zewditu Memorial Hospital",
              licenseNumber: "MED-ETH-2024-1102",
              email: "admin@zewdituhospital.org",
              phone: "+251 11 551 8085",
              createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
              location: { address: "Addis Ababa, Kirkos Sub City", lat: 9.0177, lng: 38.7612 }
            }
          ]
        }
      });
    }

    if (config.url?.match(/\/api\/superadmin\/hospitals\/.*\/approve/)) {
      return Promise.reject({
        isMock: true,
        data: { success: true, message: "Hospital approved successfully." }
      });
    }

    if (config.url?.match(/\/api\/superadmin\/hospitals\/.*\/reject/)) {
      return Promise.reject({
        isMock: true,
        data: { success: true, message: "Hospital rejected successfully." }
      });
    }

    if (config.url?.includes('/api/hospital/profile')) {
      return Promise.reject({
        isMock: true,
        data: {
          success: true,
          profile: {
            id: "hosp_profile_01",
            hospitalName: "Addis General Hospital",
            email: "contact@hospital.org",
            phone: "+251911234567",
            licenseNumber: "LIC-2024-9988",
            location: { address: "Bole Road, Addis Ababa", lat: 9.0054, lng: 38.7636 }
          }
        }
      });
    }

    if (config.url?.includes('/api/hospital/blood-stock')) {
      return Promise.reject({
        isMock: true,
        data: {
          success: true,
          stock: { 'A+': 32, 'A-': 8, 'B+': 20, 'B-': 5, 'AB+': 12, 'AB-': 3, 'O+': 45, 'O-': 15 }
        }
      });
    }

    if (config.url?.includes('/api/superadmin/feedbacks')) {
      return Promise.reject({
        isMock: true,
        data: {
          success: true,
          feedbacks: [
            {
              id: "fb_01",
              hospitalName: "Tikur Anbessa Hospital",
              email: "admin@tikuranbessa.gov.et",
              message: "Requesting re-evaluation of document verification.",
              status: "new",
              createdAt: new Date().toISOString()
            }
          ]
        }
      });
    }

    if (config.url?.includes('/api/superadmin/admins')) {
      return Promise.reject({
        isMock: true,
        data: {
          success: true,
          admins: [
            {
              id: "superadmin_id",
              name: "Super Administrator",
              email: "admin@legash.com",
              permissions: { canApproveHospitals: true, canPostEvents: true },
              emailVerified: true,
              createdAt: new Date().toISOString()
            }
          ]
        }
      });
    }

    if (config.url?.includes('/api/hospital/donation-records/pending/count')) {
      return Promise.reject({
        isMock: true,
        data: {
          success: true,
          count: mockPendingDonationRecords.length,
          pendingCount: mockPendingDonationRecords.length,
        }
      });
    }

    if (config.url?.includes('/api/hospital/donation-records/pending')) {
      return Promise.reject({
        isMock: true,
        data: {
          success: true,
          records: [...mockPendingDonationRecords],
          pending: [...mockPendingDonationRecords],
        }
      });
    }

    if (config.url?.includes('/api/hospital/donation-records') && config.method?.toLowerCase() === 'post') {
      let payload: any = {};
      try {
        payload = typeof config.data === 'string' ? JSON.parse(config.data) : (config.data || {});
      } catch {
        payload = {};
      }

      const targetId = payload.recordId || payload.acceptanceId || payload.donorId || payload.id;
      if (targetId) {
        mockPendingDonationRecords = mockPendingDonationRecords.filter(
          (r) => r.id !== targetId && r.acceptanceId !== targetId && r.donorId !== targetId
        );
      } else if (mockPendingDonationRecords.length > 0) {
        mockPendingDonationRecords.shift();
      }

      return Promise.reject({
        isMock: true,
        data: {
          success: true,
          message: payload.outcome === 'donated' 
            ? 'Donation record confirmed and verified successfully.' 
            : 'Donor marked as did not donate.',
          remainingCount: mockPendingDonationRecords.length,
        }
      });
    }

    if (config.url?.includes('/api/ai/chat') && config.method?.toLowerCase() === 'post') {
      let payload: any = {};
      try {
        payload = typeof config.data === 'string' ? JSON.parse(config.data) : (config.data || {});
      } catch {
        payload = {};
      }

      const userText = (payload?.message || '').toLowerCase();
      const existingConvId = payload?.conversationId;
      const activeConvId = existingConvId || `conv_session_${Date.now()}`;

      let reply = "Hello! I am your Legash AI Health Assistant. I can answer clinical blood compatibility rules, post-donation recovery guidelines, and general wellness nutrition questions. How can I help your facility today?";

      if (userText.includes('fluid') || userText.includes('care') || userText.includes('tips') || userText.includes('first-time')) {
        reply = "For first-time donors, recommend drinking at least 500ml of water before donation and 4-6 glasses over the next 24 hours. Keep the bandage on for 4 hours, avoid heavy lifting or strenuous exercise for the remainder of the day, and consume an iron-rich balanced meal.";
      } else if (userText.includes('universal') || userText.includes('compatibility') || userText.includes('rules')) {
        reply = "Compatibility Rules:\n• Type O- is the universal red blood cell donor (accepted by all groups in trauma situations).\n• Type AB+ is the universal red blood cell recipient.\n• Type AB is the universal plasma donor, whereas Type O is the universal plasma recipient.\nAlways perform standard crossmatching prior to non-emergency transfusion.";
      } else if (userText.includes('hydration') || userText.includes('ferritin') || userText.includes('recovery')) {
        reply = "Hydration supports rapid blood volume restoration (within 24-48 hours). Ferritin stores support hemoglobin replenishment, which typically takes 4-8 weeks. Encourage donors to consume dietary iron (spinach, lentils, lean meats) paired with Vitamin C to optimize absorption.";
      } else if (userText.includes('how to') || userText.includes('system') || userText.includes('password') || userText.includes('login') || userText.includes('portal')) {
        reply = "Notice: As a health and wellness assistant, I cannot resolve system how-to questions, facility password changes, or account management. Please use the Help Center (Part 7) or contact your network administrator for portal assistance.";
      }

      return Promise.reject({
        isMock: true,
        data: {
          success: true,
          reply,
          conversationId: activeConvId,
        }
      });
    }

    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // --- TEMPORARY MOCK ---
    if (error.isMock) {
      return Promise.resolve({ data: error.data, status: 200 });
    }

    // If 401 Unauthorized occurs on a protected resource, don't redirect if it was a login attempt
    if (error.response?.status === 401) {
      const requestUrl = error.config?.url || '';
      if (!requestUrl.includes('/login') && !requestUrl.includes('/auth/login')) {
        // Clear expired auth data
        localStorage.removeItem('token');
        localStorage.removeItem('auth_token');
        localStorage.removeItem('hospital_user');
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('auth_token');
        sessionStorage.removeItem('hospital_user');
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
