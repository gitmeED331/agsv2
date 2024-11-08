#!/usr/bin/gjs -m

/**
 * MIT License
 *
 * Copyright (c) 2024 TopsyKrets
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction...
 *
 */

import { App } from "astal/gtk3";
import monitorStyle from "./cssHotLoad";

monitorStyle;

import {
	Bar,
	Dashboard,
	MediaPlayerWindow,
	NotificationPopups,
	// Overview,
	sessioncontrol,
	Launcher,
	cliphist,
	wallpapers,
} from "./modules/Windows/index";

App.start({
	main() {
		Bar({ monitor: 0 });
		cliphist({ monitor: 0 });
		Dashboard({ monitor: 0 });
		Launcher({ monitor: 0 });
		MediaPlayerWindow();
		NotificationPopups({ monitor: 0 });
		sessioncontrol({ monitor: 0 });
		wallpapers();
	},
});

/* old css hot reload
async function monitorStyle() {
	const Globals = `${SRC}/style/globals`; // monitored/read for changes
	const Components = `${SRC}/style/components`; // monitored/read for changes
	const Variables = `${SRC}/style/variables.scss`; // monitored/read for changes
	const Main = `${SRC}/style/main.scss`;
	const scss = `${SRC}/style/main.scss`; // monitored/read for changes
	const css = `/tmp/style.css`; // output file

	monitorFile(Globals, () => transpileAndApply());
	monitorFile(Components, () => transpileAndApply());
	monitorFile(Variables, () => transpileAndApply());
	monitorFile(Main, () => transpileAndApply());

	async function transpileAndApply() {
		try {
			await execAsync(`sass ${scss} ${css}`);
			App.apply_css(css, true);
			print("CSS applied successfully!");
		} catch (error) {
			print("Error transpiling SCSS:", error);
			execAsync(`notify-send -u critical "Error transpiling SCSS" "${error}"`);
		}
	}
	return transpileAndApply();
}
	*/
