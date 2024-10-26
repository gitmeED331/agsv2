#!/usr/bin/gjs -m
import { App } from "astal/gtk3";
import { execAsync, monitorFile } from "astal";
// import style from "./style/main.scss";

async function monitorStyle() {
	const Globals = `${SRC}/style/globals`;
	const Components = `${SRC}/style/components`;
	const variables = `${SRC}/style/variables.scss`;
	const scss = `${SRC}/style/main.scss`;
	const css = `/tmp/style.css`;

	monitorFile(Globals, () => transpileAndApply());
	monitorFile(Components, () => transpileAndApply());
	monitorFile(variables, () => transpileAndApply());

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

monitorStyle()

import {
	Bar,
	Dashboard,
	MediaPlayerWindow,
	NotificationPopups,
	// Overview,
	sessioncontrol,
	Launcher,
	cliphist,
	wallpapers
} from "./modules/Windows/index";

App.start({
	// css: style,
	main() {
		Bar({ monitor: 0 });
		cliphist({ monitor: 0 });
		Dashboard({ monitor: 0 });
		Launcher({ monitor: 0 });
		MediaPlayerWindow();
		NotificationPopups({ monitor: 0 });
		// Overview();
		sessioncontrol({ monitor: 0 });
		wallpapers();
	},
});
