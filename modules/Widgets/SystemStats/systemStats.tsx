import { Gtk } from "astal/gtk3";
import { bind, Variable } from "astal";
import { cpuUsage, memoryAvailable, memoryTotal, memoryUsage } from "./StatsCalc";


function systemStats() {
  const memoryTooltip = Variable.derive(
    [memoryAvailable, memoryTotal],
    (available, total) => `${((total - available) / 1024 / 1024).toFixed(1)} GiB used`
  );

  const CpuIndicator = () => {
    return (
      <box
        className={"stats cpu"}
        spacing={4}
      >
        <icon icon="device_cpu" />
        <label label={cpuUsage((usage) => `${Math.floor(usage * 100)}%`)} />
      </box>
    );
  };

  const MemoryIndicator = () => {
    return (
      <box
        className={"stats ram"}
        tooltipText={memoryUsage((usage) => `${Math.floor(usage * 100)}%`)}
        spacing={4}
      >
        <icon icon="gnome-dev-memory" />
        <label label={memoryTooltip()} />
      </box>
    );
  };
  return (
    <box className={"stats"} halign={CENTER} valign={CENTER} spacing={10}>
      {[CpuIndicator(), MemoryIndicator()]}
    </box>
  );
}

export default systemStats;
