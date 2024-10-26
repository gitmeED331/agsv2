#!/usr/bin/gjs -m
import { App } from "astal/gtk3";
import { execAsync, monitorFile } from "astal";

/* CSS Hot Reload */
async function monitorStyle() {
	const pathsToMonitor = [
		`${SRC}/style/globals`,
		`${SRC}/style/components`,
		`${SRC}/style/variables.scss`,
	]; // paths monitored/read for changes

	const mainScss = `${SRC}/style/main.scss`; // SCSS input file to compile
	const css = `/tmp/style.css`; // CSS output file

	let debounceTimeout;
	function debouncedTranspileAndApply() {
		clearTimeout(debounceTimeout);
		debounceTimeout = setTimeout(transpileAndApply, 100);
	}

	pathsToMonitor.forEach(path => monitorFile(path, debouncedTranspileAndApply));

	async function transpileAndApply() {
		try {
			await execAsync(`sass ${mainScss} ${css}`);
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