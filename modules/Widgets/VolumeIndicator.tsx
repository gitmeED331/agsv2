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
import AstalWp from "gi://AstalWp";
import { dashboardLeftStack } from "../Windows/dashboard/LeftSide";

const { audio } = AstalWp.get_default();
const Speaker = audio.get_default_speaker();

function VolumeIndicator() {
	const volumeIndicatorClassName = Variable.derive([bind(Speaker, "mute")], (isMuted) => {
		const classes = ["volume-indicator"];
		if (isMuted) {
			classes.push("muted");
		}
		const className = classes.join(" ");
		return className;
	});

	const tooltip = Variable.derive([bind(Speaker, "volume"), bind(Speaker, "mute")], (v, m) => (m ? "Muted" : `Volume ${(v * 100).toFixed(2)}%`));

	return (
		<button
			tooltip_text={bind(tooltip)}
			className={bind(volumeIndicatorClassName)}
			onClick={(_, event) => {
				if (event.button === Gdk.BUTTON_PRIMARY) {
					const dashTab = "settings";
					const win = App.get_window("dashboard");
					const dashboardTab = dashboardLeftStack.get_visible_child_name() === dashTab;
					const setDashboardTab = dashboardLeftStack.set_visible_child_name(dashTab);
					if (win) {
						if (win.visible === true && !dashboardTab) {
							setDashboardTab;
						} else if (win.visible === true && dashboardTab) {
							win.visible = !win.visible;
						} else {
							win.visible = !win.visible;
						}
					}
				}
				if (event.button === Gdk.BUTTON_SECONDARY) {
					Speaker?.set_mute(!Speaker.get_mute());
				}
			}}
			onScroll={(_, { delta_y }) => {
				const volumeChange = delta_y < 0 ? 0.05 : -0.05;
				Speaker?.set_volume(Speaker.volume + volumeChange);
				Speaker?.set_mute(false);
			}}
		>
			<icon icon={bind(Speaker, "volume_icon")} />
		</button>
	);
}
export default VolumeIndicator;
