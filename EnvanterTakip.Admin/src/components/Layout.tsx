import { NavLink, Outlet } from "react-router-dom";

const NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: "\u25A6" },
  { to: "/products", label: "Ürünler", icon: "\u25A3" },
  { to: "/sales", label: "Satışlar", icon: "\u25B6" },
  { to: "/stock-entries", label: "Girişler", icon: "\u2B06" },
  { to: "/settings", label: "Ayarlar", icon: "\u2699" },
];

export default function Layout() {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <aside
        style={{
          width: 240,
          background: "var(--sidebar-bg)",
          color: "var(--sidebar-text)",
          padding: "24px 0",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            padding: "0 20px 24px",
            borderBottom: "1px solid rgba(255,255,255,0.1)",
            marginBottom: 16,
          }}
        >
          <h1 style={{ fontSize: 18, fontWeight: 600, color: "var(--sidebar-active-text)" }}>
            EnvanterTakip
          </h1>
        </div>
        <nav style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              style={({ isActive }) => ({
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 20px",
                color: isActive ? "var(--sidebar-active-text)" : "var(--sidebar-text)",
                background: isActive ? "var(--sidebar-active)" : "transparent",
                textDecoration: "none",
                fontSize: 14,
                fontWeight: isActive ? 500 : 400,
                borderLeft: isActive
                  ? "3px solid var(--primary)"
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
