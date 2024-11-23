/**
 * MIT License
 *
 * Copyright (c) 2024 TopsyKrets
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction...
 *
 */

import { Astal, Gtk, Gdk, App, Widget } from "astal/gtk3";
import { bind, Variable } from "astal";
import Icon, { Icons } from "../../lib/icons";
import AstalNetwork from "gi://AstalNetwork";
import NM from "gi://NM";

function header(wired) {
	const ethernetIcon = <icon icon={bind(wired, "icon_name")} />;

	const ethernetLabel = <label label={"Ethernet"} />;

	return (
		<box halign={Gtk.Align.CENTER} valign={Gtk.Align.CENTER} vertical={false} spacing={5}>
			{[ethernetIcon, ethernetLabel]}
		</box>
	);
}
function status(wired) {
	return (
		<box halign={Gtk.Align.CENTER} valign={Gtk.Align.CENTER} spacing={5}>
			<label
				label={bind(wired.device, "state").as((i) => {
					switch (i) {
						case 100:
							return "Connected";
						case 70:
							return "Connecting...";
						case 20:
							return "Disconnected";
						default:
							return "Disconnected";
					}
				})}
				halign={Gtk.Align.CENTER}
				valign={Gtk.Align.CENTER}
			/>
		</box>
	);
}

function EthernetWidget() {
	const network = AstalNetwork.get_default();
	const Wired = network.wired;

	return (
		<box className={"network ethernet container"} halign={Gtk.Align.CENTER} valign={Gtk.Align.CENTER} vertical={false} spacing={5}>
			{[header(Wired), status(Wired)]}
		</box>
	);
}

export default EthernetWidget;
