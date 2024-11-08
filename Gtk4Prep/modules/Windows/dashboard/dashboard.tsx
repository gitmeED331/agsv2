/**
 * MIT License
 *
 * Copyright (c) 2024 TopsyKrets
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction...
 *
 */

import { Astal, Gtk, App, Gdk, astalify, ConstructProps } from "astal/gtk4";
import { GObject } from "astal";
import { winheight, winwidth } from "../../lib/screensizeadjust";
import Mpris from "gi://AstalMpris";
import { Grid } from "../../Astalified/index";
import ClickToClose from "../../lib/ClickToClose";

// --- imported widgets ---
import { Tray, Player } from "../../Widgets/index";
import LeftSide, { dashboardLeftStack } from "./LeftSide";
import RightSide, { dashboardRightStack } from "./RightSide";

const player = Mpris.Player.new("Deezer");

function Dashboard({ monitor }: { monitor: number }) {
	const content = <Grid cssClasses={"dashboard grid"} halign={Gtk.Align.FILL} valign={Gtk.Align.FILL} hexpand={true} vexpand={true} column_spacing={5} row_spacing={5} />;

	content.attach(<Player player={player} />, 1, 0, 3, 1);
	content.attach(ClickToClose(1, 0.25, 0.1, "dashboard"), 0, 0, 1, 2);
	content.attach(LeftSide(), 1, 1, 1, 1);
	content.attach(Tray(), 2, 1, 1, 1);
	content.attach(RightSide(), 3, 1, 1, 1);
	content.attach(ClickToClose(2, 0.25, 0.1, "dashboard"), 4, 0, 1, 2);
	content.attach(ClickToClose(3, 1, 0.5, "dashboard"), 0, 2, 5, 1);

	return (
		<window
			name={"dashboard"}
			cssClasses={"dashboard window"}
			anchor={Astal.WindowAnchor.TOP | Astal.WindowAnchor.LEFT | Astal.WindowAnchor.RIGHT | Astal.WindowAnchor.BOTTOM}
			layer={Astal.Layer.OVERLAY}
			exclusivity={Astal.Exclusivity.NORMAL}
			keymode={Astal.Keymode.EXCLUSIVE}
			visible={false}
			application={App}
			onKeyPressed={(_, event) => {
				const win = App.get_window("dashboard");
				if (event.get_keyval() === Gdk.KEY_Escape) {
					if (win && win.visible === true) {
						win.visible = false;
					}
				}
			}}
		>
			<box>{content}</box>
		</window>
	);
}

App.connect("window-toggled", (_, win) => {
	if (!win.visible && win.name === "dashboard") {
		dashboardLeftStack.set_visible_child_name("calendar");
		dashboardRightStack.set_visible_child_name("notifications");
	}
});

export default Dashboard;
