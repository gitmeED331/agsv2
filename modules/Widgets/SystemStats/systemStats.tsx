import { Gtk } from "astal/gtk3";
import { bind } from "astal";
import { cpuUsage, memoryAvailable, memoryTotal, memoryUsage } from "./StatsCalc";


function systemStats() {

  const cpuCP = (
    <circularprogress
      className={"stats cpu"}
      value={bind(cpuUsage)}
      valign={CENTER} halign={CENTER}
      rounded={true}
      startAt={0.75} endAt={-0.25} inverted={false}
    >
      <box halign={CENTER} valign={CENTER}>
        {cpuUsage().as(u => Math.floor(u * 100))}%
      </box>
    </circularprogress>
  );
  const ramCP = (
    <circularprogress
      className={"stats ram"}
      value={bind(memoryUsage).as(f => f)}
      valign={CENTER} halign={CENTER}
      rounded={true}
      startAt={0.75} endAt={- 0.25} inverted={false}
    >
      <box valign={CENTER} halign={CENTER}>
        {bind(memoryAvailable).as(u => Math.abs((u / 1024) / 1024).toFixed(1))}/
        {bind(memoryTotal).as(u => Math.abs((u / 1024) / 1024).toFixed(1))}
      </box>
    </circularprogress >
  );

  return (
    <box className={"stats"} halign={CENTER} valign={CENTER} spacing={10}>
      {[cpuCP, ramCP]}
    </box>
  );
}

export default systemStats;
