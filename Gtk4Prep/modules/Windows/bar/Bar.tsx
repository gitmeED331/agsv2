/**
 * MIT License
 *
 * Copyright (c) 2024 TopsyKrets
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction...
 *
 */

import { Astal, Gtk, Gdk, App, Widget } from "astal/gtk4";
import { GLib, bind } from "astal";
// ----- Widgets -----
import Clock from "./clock";
import SysInfo from "./sysinfo";
import MediaTickerButton from "./MediaTicker";

const wm = GLib.getenv("XDG_CURRENT_DESKTOP")?.toLowerCase();

function loadWorkspaces(wm: string) {
	if (wm === "hyprland") {
		const { default: HyprWorkspaces } = require("./Workspaces/HyprWorkspaces");
		return HyprWorkspaces;
	} else if (wm === "river") {
		const { default: RiverWorkspaces } = require("./Workspaces/RiverWorkspaces");
		return RiverWorkspaces;
	}
}

function loadAppTitleTicker(wm: string) {
	if (wm === "hyprland") {
		const { default: HyprAppTitleTicker } = require("./AppTitleTicker/HyprAppTitleTicker");
		return HyprAppTitleTicker;
	} else if (wm === "river") {
		const { default: RiverAppTitleTicker } = require("./AppTitleTicker/RiverAppTitleTicker");
		return RiverAppTitleTicker;
	}
}

function LeftBar() {
	const WorkspacesComponent = loadWorkspaces(wm);
	const AppTitleTickerComponent = loadAppTitleTicker(wm);

	return (
		<box cssClasses="left" halign={Gtk.Align.START} valign={Gtk.Align.START} spacing={5}>
			<WorkspacesComponent id={Number()} />
			<AppTitleTickerComponent />
		</box>
	);
}

function CenterBar() {
	return (
		<box cssClasses={"center"} spacing={10} halign={Gtk.Align.CENTER} valign={Gtk.Align.START}>
			<Clock />
		</box>
	);
}

function RightBar() {
	return (
		<box cssClasses={"right"} halign={Gtk.Align.END} valign={Gtk.Align.START} spacing={5}>
			<MediaTickerButton />
			<SysInfo />
		</box>
	);
}

export default function Bar({ monitor }: { monitor: number }) {
	return (
		<window
			cssClasses={"bar"}
			name={`bar${monitor}`}
			monitor={monitor}
			application={App}
			anchor={Astal.WindowAnchor.TOP | Astal.WindowAnchor.LEFT | Astal.WindowAnchor.RIGHT}
			exclusivity={Astal.Exclusivity.EXCLUSIVE}
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
