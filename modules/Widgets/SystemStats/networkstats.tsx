import { bind } from "astal";
import AstalNetwork from "gi://AstalNetwork";
import { networkStats } from "../SystemStats/StatsCalc";

const INTERNET_STATE_NAMES = {
    [AstalNetwork.Internet.CONNECTED]: "Connected",
    [AstalNetwork.Internet.CONNECTING]: "Connecting...",
    [AstalNetwork.Internet.DISCONNECTED]: "D/C",
};
const MAX_NETWORK_USAGE = 12_500_000;

function getTotalNetworkThroughput(stats?: { rx: number; tx: number }) {
    if (!stats) {
        return 0;
    } else {
        return stats.rx + stats.tx;
    }
}

function formatNetworkThroughput(value: number, unitIndex: number = 0) {
    // I don't think anyone has exabit internet yet
    const UNITS = ["B", "kB", "MB", "GB", "TB"];

    // never show in bytes, since it's one letter
    unitIndex += 1;
    value /= 1000;

    if (value < 10) {
        return `${value.toFixed(2)} ${UNITS[unitIndex]}/s`;
    } else if (value < 100) {
        return `${value.toFixed(1)} ${UNITS[unitIndex]}/s`;
    } else if (value < 1000) {
        return `${(value / 1000).toFixed(2)} ${UNITS[unitIndex + 1]}/s`;
    } else {
        // do not increase here since it's done at the start of the function
        return formatNetworkThroughput(value, unitIndex);
    }
}


const NetworkUsage = ({ iface }: { iface: string }) => {
    return (
        <label
            label={bind(networkStats).as(
                (stats) => `${formatNetworkThroughput(getTotalNetworkThroughput(stats[iface]))}`
            )}
        />
    );
};
const NetworkIndicatorWired = ({ iface }: { iface?: string }) => {
    const network = AstalNetwork.get_default();
    const status = bind(network.wired, "internet").as((state) => {
        if (state == AstalNetwork.Internet.CONNECTED && iface) {
            return <NetworkUsage iface={iface} />;
        } else {
            return <label label={INTERNET_STATE_NAMES[state]} />;
        }
    });

    return (
        <box spacing={4} halign={CENTER}>
            {status}
        </box>
    );
};


export const wired = <box className={"stats wired"} spacing={5}>
    <icon icon={"gnome-dev-ethernet"} />
    <NetworkIndicatorWired iface={"enp1s0"} />
</box>
export const wifi = <box className={"stats wifi"} spacing={5}>
    <icon icon={"network-wireless-hotspot-symbolic"} />
    <NetworkIndicatorWired iface={"wlan0"} />
</box>