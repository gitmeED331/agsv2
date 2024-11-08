/**
 * MIT License
 *
 * Copyright (c) 2024 TopsyKrets
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction...
 *
 */

import { Gtk } from "astal/gtk4";
import { StackSwitcher, Stack, StackSidebar } from "../../Astalified/index";

import { BrightnessSlider, GridCalendar, PowerProfiles, AudioMixer, SessionControls } from "../../Widgets/index";

export let dashboardLeftStack;

export default function LeftSide() {
	const settings = (
		<box name={"settings"} vertical={true} spacing={10}>
			<AudioMixer />
			<BrightnessSlider />
		</box>
	);
	const power = (
		<box name={"power"} cssClasses={"dashboard power"} vertical={true} spacing={10}>
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
			hexpand={true}
			vexpand={true}
		/>
	);

	leftStack.add_titled(GridCalendar(), "calendar", "Calendar");
	leftStack.add_titled(power, "power", "Power");
	leftStack.add_titled(settings, "settings", "Settings");

	const stackSwitcher = (
		<StackSwitcher cssClasses={"dashboard stackSwitcher"} stack={leftStack as Stack} halign={Gtk.Align.CENTER} valign={Gtk.Align.START} spacing={10} iconSize={Gtk.IconSize.BUTTON} />
	);

	dashboardLeftStack = leftStack;

	return (
		<box cssClasses={"dashboard leftSide"} vertical={true} halign={Gtk.Align.FILL} valign={Gtk.Align.START} hexpand={true} vexpand={true} spacing={10}>
			{[stackSwitcher, leftStack]}
		</box>
	);
}
