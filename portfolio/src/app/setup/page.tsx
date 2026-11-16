import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

const setup = [
  {
    category: "Home Lab",
    items: [
      { name: "Proxmox VE", note: "Type 1 hypervisor on bare metal" },
      { name: "Docker", note: "containers inside Proxmox Ubuntu Server VMs" },
      { name: "Tailscale", note: "WireGuard mesh, access everything from anywhere" },
      { name: "LXC containers", note: "for anything a VM cant cover (Frigate)" },
    ],
  },
  {
    category: "Editor",
    items: [
      { name: "VS Code", note: "day-to-day" },
      { name: "Neovim", note: "for servers. Hopefully day-to-day some day" }
    ],
  },
  {
    category: "Stack",
    items: [
      { name: "C++", note: "job/work" },
      { name: "C#", note: "job/work" },
      { name: "TypeScript", note: "always" },
      { name: "Next.js", note: "frontend + API routes" },
      { name: "Node.js / Express", note: "backend services" },
      { name: "Expo", note: "mobile (Android)" },
    ],
  },
];

export default function Setup() {
  return (
    <main className="min-h-screen px-6 py-16 max-w-2xl mx-auto flex flex-col gap-16">
      <Nav />

      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl md:text-4xl font-heading font-bold tracking-tight">
            Setup
          </h1>
          <p className="text-[var(--muted)] text-sm font-mono">
            Gear, software, and infrastructure I actually use.
          </p>
        </div>

        <div className="flex flex-col gap-8">
          {setup.map((group) => (
            <div key={group.category} className="flex flex-col gap-2">
              <span className="text-xs font-mono text-[#555] uppercase tracking-widest">
                {group.category}
              </span>
              <div className="flex flex-col">
                {group.items.map((item, i) => (
                  <div
                    key={item.name}
                    className={`flex items-center justify-between py-2.5 text-sm ${
                      i < group.items.length - 1 ? "border-b border-[var(--border)]" : ""
                    }`}
                  >
                    <span className="text-[var(--muted)]">{item.name}</span>
                    <span className="text-xs font-mono text-[#444]">{item.note}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </main>
  );
}
