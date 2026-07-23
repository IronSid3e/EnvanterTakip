import { NavLink, Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <aside
        style={{
          width: 240,
          background: "#1e293b",
          color: "#e2e8f0",
          padding: "24px 0",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            padding: "0 20px 24px",
            borderBottom: "1px solid #334155",
            marginBottom: 16,
          }}
        >
          <h1 style={{ fontSize: 18, fontWeight: 600, color: "#f8fafc" }}>
            EnvanterTakip
          </h1>
        </div>
        <nav style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {[
            { to: "/", label: "Dashboard", icon: "\u25A6" },
            { to: "/products", label: "Ürünler", icon: "\u25A3" },
            { to: "/sales", label: "Satışlar", icon: "\u25B6" },
            { to: "/customers", label: "Müşteriler", icon: "\u263A" },
            { to: "/invoices", label: "Faturalar", icon: "\u2638" },
          ].map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              style={({ isActive }) => ({
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 20px",
                color: isActive ? "#f8fafc" : "#94a3b8",
                background: isActive ? "#334155" : "transparent",
                textDecoration: "none",
                fontSize: 14,
                fontWeight: isActive ? 500 : 400,
                borderLeft: isActive
                  ? "3px solid #3b82f6"
                  : "3px solid transparent",
                transition: "all 0.15s",
              })}
            >
              <span style={{ fontSize: 16 }}>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main style={{ flex: 1, padding: 32, overflow: "auto" }}>
        <Outlet />
      </main>
    </div>
  );
}
