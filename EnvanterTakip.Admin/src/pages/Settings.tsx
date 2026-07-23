import { useTheme } from "../hooks/useTheme";

export default function Settings() {
  const { theme, setTheme } = useTheme();

  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 24 }}>
        Ayarlar
      </h2>

      <div
        style={{
          background: "var(--surface)",
          borderRadius: "var(--radius)",
          boxShadow: "var(--shadow)",
          padding: 24,
          maxWidth: 480,
        }}
      >
        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>
          Görünüm
        </h3>

        <label style={{ fontSize: 14, fontWeight: 500, display: "block", marginBottom: 8 }}>
          Tema
        </label>
        <div style={{ display: "flex", gap: 8 }}>
          {([
            { value: "light" as const, label: "Açık" },
            { value: "dark" as const, label: "Koyu" },
          ]).map((opt) => (
            <button
              key={opt.value}
              onClick={() => setTheme(opt.value)}
              style={{
                padding: "8px 20px",
                borderRadius: "var(--radius)",
                border: theme === opt.value
                  ? "2px solid var(--primary)"
                  : "1px solid var(--border)",
                background: theme === opt.value ? "var(--primary)" : "var(--surface-hover)",
                color: theme === opt.value ? "#fff" : "var(--text)",
                fontWeight: 500,
                fontSize: 14,
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
