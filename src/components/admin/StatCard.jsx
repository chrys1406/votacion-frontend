export default function StatCard({ icon, label, value, accentColor = "#E8FF47", tag = "" }) {
  return (
    <div style={{
      background: "#111",
      border: "0.5px solid #1E1E1E",
      borderRadius: 10,
      padding: 16,
      position: "relative",
      overflow: "hidden",
      transition: "border-color 0.15s",
      fontFamily: "'Space Grotesk', sans-serif",
      cursor: "default",
    }}
    onMouseEnter={(e) => e.currentTarget.style.borderColor = `${accentColor}30`}
    onMouseLeave={(e) => e.currentTarget.style.borderColor = "#1E1E1E"}
    >
      {/* GLOW */}
      <div style={{
        position: "absolute",
        top: -20, right: -20,
        width: 60, height: 60,
        borderRadius: "50%",
        background: accentColor,
        opacity: 0.06,
      }} />

      {/* ICON */}
      <div style={{
        width: 30, height: 30,
        borderRadius: 7,
        background: "#181818",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 14,
        color: accentColor,
      }}>
        {icon}
      </div>

      {/* VALUE */}
      <p style={{
        fontFamily: "'Instrument Serif', serif",
        fontSize: 30,
        color: "#fff",
        margin: 0,
        lineHeight: 1,
      }}>
        {value}
      </p>

      {/* LABEL */}
      <p style={{ fontSize: 11, color: "#444", margin: "5px 0 0" }}>
        {label}
      </p>

      {/* TAG */}
      {tag && (
        <span style={{
          fontSize: 9,
          color: "#333",
          background: "#181818",
          padding: "2px 7px",
          borderRadius: 20,
          display: "inline-block",
          marginTop: 8,
        }}>
          {tag}
        </span>
      )}
    </div>
  );
}
