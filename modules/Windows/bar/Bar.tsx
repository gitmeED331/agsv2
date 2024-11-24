/**
 * MIT License
 *
 * Copyright (c) 2024 TopsyKrets
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction...
 *
 */

import { Astal, Gtk, Gdk, App, Widget } from "astal/gtk3";
import { GLib, bind } from "astal";
// ----- Widgets -----
import DateTimeLabel from "../../lib/datetime";
import SysInfo from "./sysinfo";
import MediaTickerButton from "./MediaTicker";
// import systemStats from "../../Widgets/systemStats";
import HyprWorkspaces from "./Workspaces/HyprWorkspaces";
import HyprAppTitleTicker from "./AppTitleTicker/HyprAppTitleTicker";

const wm = GLib.getenv("XDG_CURRENT_DESKTOP")?.toLowerCase();

function LeftBar() {
	return (
		<box
			className={"left"}
			halign={Gtk.Align.START}
			valign={Gtk.Align.START}
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
		<box className={"center"} spacing={10} halign={Gtk.Align.CENTER} valign={Gtk.Align.START}>
			<button
				className="clock"
				cursor="pointer"
				onClick={(_, event) => {
					App.toggle_window("dashboard");
				}}
			>
				<box halign={Gtk.Align.CENTER} valign={Gtk.Align.CENTER} spacing={5}>
					<DateTimeLabel format="%H:%M:%S" interval={500} />
					<icon icon="nix-snowflake-symbolic" valign={Gtk.Align.CENTER} halign={Gtk.Align.CENTER} />
					<DateTimeLabel format="%a %b %d" interval={3600000} />
				</box>
			</button>
		</box>
	);
}

function RightBar() {
	return (
		<box className={"right"} halign={Gtk.Align.END} valign={Gtk.Align.START} spacing={5}>
			<MediaTickerButton />
			<SysInfo />
		</box>
	);
}

export default function Bar({ monitor }: { monitor: number }) {
	return (
		<window
			className={"bar"}
			name={`bar${monitor}`}
			monitor={monitor}
			application={App}
			anchor={Astal.WindowAnchor.TOP | Astal.WindowAnchor.LEFT | Astal.WindowAnchor.RIGHT}
			exclusivity={Astal.Exclusivity.EXCLUSIVE}
			layer={Astal.Layer.TOP}
		>
			<centerbox
				halign={Gtk.Align.FILL}
				valign={Gtk.Align.START}
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
