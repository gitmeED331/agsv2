import { Astal, Gtk, Gdk, App, Widget } from "astal/gtk3";
import { GLib, bind, Variable } from "astal";

// Create variables for CPU and RAM usage
const cpu = new Variable(0); // CPU load percentage
const ram = new Variable(0); // RAM usage percentage

// Function to fetch system stats
function fetchSystemStats() {
  // Fetch CPU load
  const cpuLoad = parseFloat(GLib.spawn_command_line_sync("sh -c \"grep 'cpu ' /proc/stat | awk '{usage=($2+$4)*100/($2+$4+$5); print usage}'\"")[1]?.toString() || "0");
  cpu.set(cpuLoad);

  // Fetch RAM usage
  const memInfo = GLib.spawn_command_line_sync("cat /proc/meminfo")[1]?.toString() || "";
  const memTotal = parseInt(memInfo.match(/MemTotal:\s+(\d+)/)?.[1] || "0", 10); // Total RAM in kB
  const memAvailable = parseInt(memInfo.match(/MemAvailable:\s+(\d+)/)?.[1] || "0", 10); // Available RAM in kB
  const memUsed = memTotal - memAvailable;
  const ramUsage = (memUsed / memTotal) * 100;
  ram.set(ramUsage);
}

// Update system stats periodically
GLib.timeout_add(GLib.PRIORITY_DEFAULT, 1000, () => {
  fetchSystemStats();
  return true; // Keep repeating
});

function systemStats() {
  // Create circular progress indicators for CPU and RAM using bind()
  const cpuCP = (
    <circularprogress
      value={bind(cpu)}
      valign={Gtk.Align.CENTER}
      halign={Gtk.Align.CENTER}
    />
  );
  const ramCP = (
    <circularprogress
      value={bind(ram)}
      valign={Gtk.Align.CENTER}
      halign={Gtk.Align.CENTER}
    />
  );

  // Labels for detailed RAM usage
  const ramLabel = <label label={bind(() => `${(ram.get() * memTotal / 100 / 1024).toFixed(2)}GB / ${(memTotal / 1024).toFixed(2)}GB`)} />;

  return (
    <box orientation={Gtk.Orientation.VERTICAL}>
      {[cpuCP, ramCP, ramLabel]}
    </box>
  );
}

export default systemStats;
