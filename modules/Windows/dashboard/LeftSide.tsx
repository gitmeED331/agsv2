/**
 * MIT License
 *
 * Copyright (c) 2024 TopsyKrets
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction...
 *
 */

import { Gtk } from "astal/gtk3";
import { StackSwitcher, Stack, StackSidebar } from "../../Astalified/index";

import {
	BrightnessSlider,
	GridCalendar,
	PowerProfiles,
	AudioMixer,
	SessionControls
} from "../../Widgets/index";

export let dashboardLeftStack: Stack;

export default function LeftSide() {
	const settings = (
		<box name={"settings"} vertical={true} spacing={10}>
			<AudioMixer />
			<BrightnessSlider />
		</box>
	);
	const power = (
		<box name={"power"} className={"dashboard power"} vertical={true} spacing={10}>
			<PowerProfiles />
			<SessionControls />
		</box>
	);

	const leftStack = (
		<Stack
			transitionType={Gtk.StackTransitionType.SLIDE_LEFT_RIGHT}
			transitionDuration={300}
			halign={Gtk.Align.FILL}
			valign={Gtk.Align.FILL}
			hhomogeneous={true}
			vhomogeneous={false}
			visible={true}
			hexpand={true}
			vexpand={true}
			setup={(self) => {
				self.add_titled(GridCalendar(), "calendar", "Calendar");
				self.add_titled(power, "power", "Power");
				self.add_titled(settings, "settings", "Settings");
			}}
		/>
	);

	const stackSwitcher = <StackSwitcher className={"dashboard stackSwitcher"} stack={leftStack as Gtk.Stack} halign={Gtk.Align.CENTER} valign={Gtk.Align.START} spacing={10} />;

	dashboardLeftStack = leftStack as Stack;

	return (
		<box className={"dashboard leftSide"} vertical={true} halign={Gtk.Align.FILL} valign={Gtk.Align.START} hexpand={true} vexpand={true} spacing={10}>
			{[stackSwitcher, leftStack]}
		</box>
	);
}
