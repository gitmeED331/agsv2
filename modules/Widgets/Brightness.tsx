/**
 * MIT License
 *
 * Copyright (c) 2024 TopsyKrets
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction...
 *
 */

import { Astal, Gtk, Gdk, App } from "astal/gtk3";
import { bind, exec, execAsync, monitorFile, Variable } from "astal";
import Icon from "../lib/icons";
import Pango from "gi://Pango";

const BrightLevel = Icon.brightness.levels;

function getIconForBrightness(value) {
	const brightnessLevels = Object.values(BrightLevel);
	for (let i = 0; i < brightnessLevels.length - 1; i++) {
		if (value < (i + 1) * 15) {
			return brightnessLevels[i];
		}
	}
	return brightnessLevels[brightnessLevels.length - 1];
}

function getValue() {
	const brightness = parseInt(exec("light -G").trim()) || 0;
	return brightness;
}

let currentBrightness = Variable(getValue());
let currentIcon = BrightLevel.b1;

export default function BrightnessSlider() {
	function initializeValues() {
		currentBrightness = getValue();
		currentIcon = getIconForBrightness(currentBrightness);

		slider.value = currentBrightness;
		theIcon.icon = currentIcon;
	}
	monitorFile("/sys/class/backlight/intel_backlight/actual_brightness", () => {
		currentBrightness = getValue();
		currentIcon = getIconForBrightness(currentBrightness);
		theIcon.icon = currentIcon;
		slider.value = currentBrightness;
	});
	const slider = (
		<slider
			className={"Slider"}
			hexpand={true}
			drawValue={false}
			min={0}
			max={100}
			value={bind(currentBrightness)}
			visible={true}
			onDragged={({ value }) => {
				execAsync(`light -S ${value}`).catch();
				const newIcon = getIconForBrightness(value);
				if (currentIcon !== newIcon) {
					currentIcon = newIcon;
					theIcon.icon = newIcon;
				}
			}}
		/>
	);

	const theTitle = <label className={"header"} wrap={false} hexpand={true} halign={Gtk.Align.CENTER} xalign={0} yalign={0} ellipsize={Pango.EllipsizeMode.END} label="Brightness" />;

	const theIcon = <icon halign={Gtk.Align.START} valign={Gtk.Align.CENTER} icon={getIconForBrightness(getValue())} />;

	setTimeout(initializeValues, 0);

	return (
		<box className={"brightness"} halign={Gtk.Align.FILL} valign={Gtk.Align.FILL} vertical={true} spacing={5}>
			{theTitle}
			<box halign={Gtk.Align.CENTER} valign={Gtk.Align.CENTER} spacing={10}>
				{theIcon}
				{slider}
			</box>
		</box>
	);
}
