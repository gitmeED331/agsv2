import { Astal, App, Gtk, Gdk } from "astal/gtk3";
import { GLib, GObject, exec, execAsync, Gio } from "astal";
// ----- Widgets -----
import DateTimeLabel from "../../lib/datetime";
import SysInfo from "./sysinfo";
import MediaTickerButton from "./MediaTicker";

const wm = GLib.getenv("XDG_CURRENT_DESKTOP")?.toLowerCase();


function LeftBar() {
	return (
		<box
			className={"left"}
			halign={START}
			valign={START}
			spacing={5}
			setup={async (self) => {
				if (wm === "river") {
					const { default: RiveWorkspaces } = await import("./Workspaces/RiverWorkspaces");
					const { default: RiverAppTitleTicker } = await import("./AppTitleTicker/RiverAppTitleTicker");
					self.add(RiveWorkspaces());
					self.add(RiverAppTitleTicker());
				} else if (wm === "hyprland") {
					const { default: HyprWorkspaces } = await import("./Workspaces/HyprWorkspaces");
					const { default: HyprAppTitleTicker } = await import("./AppTitleTicker/HyprAppTitleTicker");
					self.add(HyprWorkspaces());
					self.add(HyprAppTitleTicker());
				} else {
					const failure = <label label="leftbar failure" />;
					self.add(failure);
				}
			}}
		/>

	);
}

function CenterBar() {
	return (
		<button
			className="clock"
			cursor="pointer"
			onClick={(_, event) => {
				App.toggle_window("dashboard");
			}}
		>
			<box halign={CENTER} valign={CENTER} spacing={5}>
				<DateTimeLabel format="%H:%M:%S" interval={500} />
				<icon icon="nix-snowflake-symbolic" valign={CENTER} halign={CENTER} />
				<DateTimeLabel format="%a %b %d" interval={3600000} />
			</box>
		</button>
	);
}

function RightBar() {
	return (
		<box className={"right"} halign={END} valign={START} spacing={5}>
			<MediaTickerButton />
			<SysInfo />
		</box>
	);
}

export default function Bar(monitor: Gdk.Monitor) {
	return (
		<window
			className={"bar"}
			name={`bar${monitor}`}
			gdkmonitor={monitor}
			// monitor={monitor}
			application={App}
			anchor={TOP | LEFT | RIGHT}
			exclusivity={Astal.Exclusivity.EXCLUSIVE}
			layer={Astal.Layer.TOP}
		>
			<centerbox
				halign={FILL}
				valign={START}
				css={`
					margin-right: 7px;
				`}
			>
				<LeftBar />
				<CenterBar />
				<RightBar />
			</centerbox>
		</window>
	);
}
