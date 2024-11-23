/**
 * MIT License
 *
 * Copyright (c) 2024 TopsyKrets
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction...
 *
 */

import { Astal, Gtk, Gdk, App, Widget } from "astal/gtk3";
import { bind, execAsync, Variable } from "astal";
import Hyprland from "gi://AstalHyprland";
import Icon from "../../../lib/icons";
import { FlowBox, FlowBoxChild } from "../../../Astalified/index";

const dispatch = (arg: string | number) => {
	execAsync(`hyprctl dispatch workspace ${arg}`);
};
const moveSilently = (arg: string | number) => {
	execAsync(`hyprctl dispatch movetoworkspacesilent ${arg}`);
};

// --- signal handler ---
function ws(id: number) {
	const hyprland = Hyprland.get_default();
	const getWorkspace = () => hyprland.get_workspace(id) ?? Hyprland.Workspace.dummy(id, null);

	return Variable(getWorkspace())
		.observe(hyprland, "workspace-added", getWorkspace)
		.observe(hyprland, "workspace-removed", getWorkspace);
}
// --- end signal handler ---

// --- workspaces ---
function Workspaces() {
	const hyprland = Hyprland.get_default();
	function workspaceButton(id: number) {
		return bind(ws(id)).as((ws) => {
			const className = Variable.derive(
				[bind(hyprland, "focusedWorkspace"), bind(ws, "clients")],
				(focused, clients) => `
                ${focused === ws ? "focused" : ""}
                ${clients.length > 0 ? "occupied" : ""}
                workspacebutton
            `
			);

			const isVisible = Variable.derive(
				[bind(hyprland, "focusedWorkspace"), bind(ws, "clients")],
				(focused, clients) => id <= 4 || clients.length > 0 || focused === ws
			);

			const wsIcon = Icon.wsicon;
			const wsIconLabel = wsIcon[`ws${id}`] ? (
				<icon icon={wsIcon[`ws${id}`]} halign={Gtk.Align.CENTER} valign={Gtk.Align.CENTER} />
			) : (
				<label label={`${id}`} halign={Gtk.Align.CENTER} valign={Gtk.Align.CENTER} />
			);
			return (
				<button
					className={className()}
					visible={isVisible()}
					valign={Gtk.Align.CENTER}
					halign={Gtk.Align.CENTER}
					cursor="pointer"
					onClick={(_, event) => {
						switch (event.button) {
							case Gdk.BUTTON_PRIMARY:
								dispatch(id);
								break;
							case Gdk.BUTTON_SECONDARY:
								moveSilently(id);
								break;
							// case Gdk.BUTTON_MIDDLE:
							// 	break;
							default:
								break;
						}
					}}
				>
					<box halign={Gtk.Align.CENTER} valign={Gtk.Align.CENTER}>
						{wsIconLabel}
					</box>
				</button>
			);
		});
	}

	const workspaceButtons = [...Array(10).keys()].map((id) => workspaceButton(id + 1));

	return (
		<FlowBox
			className="hyprworkspaces"
			halign={Gtk.Align.CENTER}
			valign={Gtk.Align.CENTER}
			selectionMode={Gtk.SelectionMode.NONE}
			spacing={10}
			hexpand={true}
		>
			{workspaceButtons.map((button, index) => (
				<FlowBoxChild key={index}>
					{button}
				</FlowBoxChild>
			))}
		</FlowBox>
	)
}

export default Workspaces;