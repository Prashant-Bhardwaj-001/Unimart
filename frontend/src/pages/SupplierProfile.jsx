import { useEffect, useState } from "react";
import axios from "axios";

const BASE_URL = "http://localhost:5000/api";
const api = axios.create({ baseURL: BASE_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

function SupplierProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get("/supplier/profile");
      setProfile(res.data?.data || res.data);
    } catch (error) {
      console.error("Critical Node Trace: Profile ledger sync failure:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={loadingOverlayStyle}>
        <div style={spinnerStyle}></div>
        <div style={{ 
          marginTop: "16px", 
          fontWeight: "600", 
          color: "#64748b" 
        }}>
          Resolving Cryptographic Supplier Identity Node...
        </div>
      </div>
    );
  }

  return (
    <div style={profileWrapper}>
      
      <div style={headerSectionStyle}>
        <div>
          <span style={pillBadgeStyle}>B2B VENDOR REGISTRY METADATA</span>
          <h1 style={mainTitleStyle}>Supplier Entity Profile</h1>
          <p style={subtitleStyle}>Verified organizational infrastructure details, taxation logs, and regional communication channels.</p>
        </div>
        
        <div style={accountStatusContainer}>
          <div style={{ textAlign: "right" }}>
            <div style={statusLabelStyle}>ENTITY LIFE CYCLE STATUS</div>
            <div style={{ 
              ...statusTextBadge, 
              background: profile?.isActive ? "rgba(16, 185, 129, 0.1)" : "rgba(220, 38, 38, 0.1)",
              color: profile?.isActive ? "#059669" : "#dc2626"
            }}>
              {profile?.isActive ? "● SECURE / ACTIVE" : "● SUSPENDED"}
            </div>
          </div>
        </div>
      </div>

      <hr style={separatorLine} />

      <div style={profileDataLayoutGrid}>
        
        <div style={profileBlockSegment}>
          <h2 style={segmentTitleStyle}>🏢 Corporate Identity Details</h2>
          <div style={innerFieldsContainer}>
            <ProfileFieldCard label="Registered Company Name" value={profile?.companyName} icon="🏢" />
            <ProfileFieldCard label="Unique Supplier Access Code" value={profile?.supplierCode} icon="🔑" isMonospace={true} />
            <ProfileFieldCard label="Appointed Contact Liaison" value={profile?.contactPerson} icon="👤" />
          </div>
        </div>

        <div style={profileBlockSegment}>
          <h2 style={segmentTitleStyle}>📑 Compliance & System Channels</h2>
          <div style={innerFieldsContainer}>
            <ProfileFieldCard label="Primary Account Email Address" value={profile?.email} icon="✉️" />
            <ProfileFieldCard label="Verified Telephony Link" value={profile?.phone} icon="📱" />
            <ProfileFieldCard label="Alternative Backup Line" value={profile?.alternatePhone || "Not Assigned"} icon="☎️" />
            <ProfileFieldCard label="Federal GSTIN Tax Identification" value={profile?.gstNumber || "Unregistered"} icon="📜" isMonospace={true} />
          </div>
        </div>

        <div style={profileBlockSegment}>
          <h2 style={segmentTitleStyle}>🌐 Regional Distribution Nodes</h2>
          <div style={innerFieldsContainer}>
            <ProfileFieldCard label="Corporate Domain Website" value={profile?.website || "No Public URL Link"} icon="🔗" isLink={!!profile?.website} />
            <ProfileFieldCard label="City Registry" value={profile?.city} icon="📍" />
            <ProfileFieldCard label="State Jurisdiction" value={profile?.state} icon="🗺️" />
            <ProfileFieldCard label="Postal PIN Index Code" value={profile?.pincode} icon="📮" isMonospace={true} />
            <ProfileFieldCard label="Sovereign Country" value={profile?.country} icon="🌍" />
          </div>
        </div>

      </div>

      <div style={lowerBlockLayoutVertical}>
        
        <div style={memoDisplayContainer}>
          <h3 style={memoHeadingStyle}>📍 Primary Physical Headquarters Address</h3>
          <div style={memoBodyCardText}>
            {profile?.address || "No physical layout map registered inside database schemas."}
          </div>
        </div>

        <div style={memoDisplayContainer}>
          <h3 style={memoHeadingStyle}>📝 Operational System Memorandums / Procurement Notes</h3>
          <div style={{ 
            ...memoBodyCardText, 
            fontStyle: profile?.notes ? "normal" : "italic", 
            color: profile?.notes ? "#1e293b" : "#94a3b8" 
          }}>
            {profile?.notes || "No standard operational parameters or logistical guidelines assigned to this profile documentation."}
          </div>
        </div>

      </div>

    </div>
  );
}

function ProfileFieldCard({ label, value, icon, isMonospace, isLink }) {
  return (
    <div style={fieldCardWrapperLayout}>
      <div style={fieldIconContainer}>{icon}</div>
      <div style={{ flex: 1 }}>
        <div style={fieldCardLabelText}>{label}</div>
        {isLink ? (
          <a href={value.startsWith("http") ? value : `https://${value}`} target="_blank" rel="noreferrer" style={fieldCardLinkStyle}>
            {value}
          </a>
        ) : (
          <div style={{ 
            ...fieldCardValueText, 
            fontFamily: isMonospace ? "'JetBrains Mono', 'Fira Code', monospace" : "inherit",
            letterSpacing: isMonospace ? "0.5px" : "normal"
          }}>
            {value || "---"}
          </div>
        )}
      </div>
    </div>
  );
}

const profileWrapper = { 
  padding: "32px", 
  background: "#f8fafc", 
  minHeight: "100vh", 
  fontFamily: "'Inter', system-ui, -apple-system, sans-serif", 
  boxSizing: "border-box" 
};

const headerSectionStyle = { 
  display: "flex", 
  justifyContent: "space-between", 
  alignItems: "center", 
  flexWrap: "wrap", 
  gap: "16px" 
};

const mainTitleStyle = { 
  margin: "4px 0 0 0", 
  fontSize: "32px", 
  fontWeight: "900", 
  color: "#0f172a", 
  letterSpacing: "-0.75px" 
};

const subtitleStyle = { 
  margin: "6px 0 0 0", 
  fontSize: "14px", 
  color: "#64748b", 
  fontWeight: "400" 
};

const pillBadgeStyle = { 
  background: "rgba(37, 99, 235, 0.1)", 
  color: "#2563eb", 
  padding: "4px 10px", 
  borderRadius: "6px", 
  fontSize: "11px", 
  fontWeight: "800", 
  letterSpacing: "0.5px" 
};

const separatorLine = { 
  border: "none", 
  borderTop: "1px solid #e2e8f0", 
  margin: "24px 0 32px 0" 
};

const accountStatusContainer = { 
  display: "flex", 
  alignItems: "center", 
  background: "#fff", 
  padding: "12px 20px", 
  borderRadius: "12px", 
  border: "1px solid #e2e8f0", 
  boxShadow: "0 1px 3px rgba(0,0,0,0.02)" 
};

const statusLabelStyle = { 
  fontSize: "10px", 
  fontWeight: "800", 
  color: "#94a3b8", 
  letterSpacing: "0.5px", 
  marginBottom: "4px" 
};

const statusTextBadge = { 
  padding: "4px 10px", 
  borderRadius: "6px", 
  fontSize: "12px", 
  fontWeight: "800", 
  letterSpacing: "0.25px" 
};

const profileDataLayoutGrid = { 
  display: "grid", 
  gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", 
  gap: "24px", 
  alignItems: "flex-start" 
};

const profileBlockSegment = { 
  background: "#fff", 
  padding: "24px", 
  borderRadius: "16px", 
  border: "1px solid #e2e8f0", 
  boxShadow: "0 4px 20px -2px rgba(15, 23, 42, 0.04)" 
};

const segmentTitleStyle = { 
  margin: "0 0 20px 0", 
  fontSize: "15px", 
  fontWeight: "800", 
  color: "#0f172a", 
  borderBottom: "1px solid #f1f5f9", 
  paddingBottom: "12px" 
};

const innerFieldsContainer = { 
  display: "flex", 
  flexDirection: "column", 
  gap: "16px" 
};

const fieldCardWrapperLayout = { 
  display: "flex", 
  gap: "14px", 
  alignItems: "center", 
  background: "#f8fafc", 
  padding: "12px 16px", 
  borderRadius: "12px", 
  border: "1px solid #f1f5f9" 
};

const fieldIconContainer = { 
  width: "36px", 
  height: "36px", 
  background: "#fff", 
  borderRadius: "8px", 
  border: "1px solid #e2e8f0", 
  display: "flex", 
  alignItems: "center", 
  justifyContent: "center", 
  fontSize: "16px", 
  boxShadow: "0 1px 2px rgba(0,0,0,0.02)" 
};

const fieldCardLabelText = { 
  color: "#64748b", 
  fontSize: "11px", 
  fontWeight: "700", 
  textTransform: "uppercase", 
  letterSpacing: "0.5px", 
  marginBottom: "2px" 
};

const fieldCardValueText = { 
  color: "#1e293b", 
  fontSize: "14px", 
  fontWeight: "700" 
};

const fieldCardLinkStyle = { 
  color: "#2563eb", 
  fontSize: "14px", 
  fontWeight: "700", 
  textDecoration: "none", 
  wordBreak: "break-all" 
};

const lowerBlockLayoutVertical = { 
  display: "flex", 
  flexDirection: "column", 
  gap: "24px", 
  marginTop: "24px" 
};

const memoDisplayContainer = { 
  background: "#fff", 
  padding: "24px", 
  borderRadius: "16px", 
  border: "1px solid #e2e8f0", 
  boxShadow: "0 4px 20px -2px rgba(15, 23, 42, 0.04)" 
};

const memoHeadingStyle = { 
  margin: "0 0 12px 0", 
  fontSize: "14px", 
  fontWeight: "800", 
  color: "#0f172a", 
  textTransform: "uppercase", 
  letterSpacing: "0.5px" 
};

const memoBodyCardText = { 
  background: "#f8fafc", 
  padding: "16px", 
  borderRadius: "12px", 
  border: "1px solid #f1f5f9", 
  fontSize: "14px", 
  color: "#334155", 
  fontWeight: "500", 
  lineHeight: "1.6" 
};

const loadingOverlayStyle = { 
  minHeight: "100vh", 
  display: "flex", 
  flexDirection: "column", 
  justifyContent: "center", 
  alignItems: "center", 
  background: "#f8fafc" 
};

const spinnerStyle = { 
  width: "40px", 
  height: "40px", 
  border: "4px solid #e2e8f0", 
  borderTopColor: "#2563eb", 
  borderRadius: "50%", 
  animation: "spin 1s linear infinite" 
};

export default SupplierProfile;