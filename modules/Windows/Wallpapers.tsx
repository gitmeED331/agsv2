/**
 * MIT License
 *
 * Copyright (c) 2024 TopsyKrets
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction...
 *
 */

import { Astal, Gtk, Gdk, App, Widget } from "astal/gtk3";
import { execAsync, GLib, Gio } from "astal";
import { Grid, Spinner } from "../Astalified/index";
import { winwidth, winheight } from "../lib/screensizeadjust";
import GdkPixbuf from "gi://GdkPixbuf?version=2.0";
import Icon from "../lib/icons";
import ClickToClose from "../lib/ClickToClose";

const originalPath = `${GLib.get_user_special_dir(GLib.UserDirectory.DIRECTORY_PICTURES)}/Wallpapers`;
const cacheDir = "/tmp/wallpaper_cache";
const shellScriptPath = `${SRC}/scripts/scale_and_cache_images.sh`;
const columnCount = 5;
GLib.mkdir_with_parents(cacheDir, 0o755);

async function getCachedImagePath(wallpaperPath: string, width: number, height: number): Promise<string> {
	try {
		const stdout = await execAsync(`${shellScriptPath} "${wallpaperPath}" ${width} ${height}`);
		return stdout.trim();
	} catch (error) {
		console.error(`Error retrieving cached image path: ${error.message}`);
		return wallpaperPath;
	}
}

async function getWallpapers(): Promise<Array<{ name: string; path: string; originalPath: string }>> {
	try {
		const stdout = await execAsync(`${shellScriptPath}`);
		const paths = stdout
			.trim()
			.split("\n")
			.filter((path) => path.trim() !== "");

		return paths.map((path) => ({
			name: path.split("/").pop() || "Unknown",
			path,
			originalPath: path.replace(cacheDir, originalPath),
		}));
	} catch (error) {
		console.error("Error executing script to retrieve wallpapers:", error);
		return [];
	}
}

async function createWallpaperGrid(wps) {
	const grid = (
		<Grid
			hexpand={true}
			vexpand={false}
			halign={Gtk.Align.FILL}
			valign={Gtk.Align.FILL}
			rowHomogeneous={true}
			columnHomogeneous={true}
			row_spacing={10}
			column_spacing={5}
			widthRequest={winwidth(0.35)}
			heightRequest={winheight(0.35)}
			css={`
				padding: 1rem;
			`}
		/>
	);

	for (const [index, wp] of wps.entries()) {
		const cachedImagePath = await getCachedImagePath(wp.originalPath, winwidth(0.05), winheight(0.05));

		const wpButton = (
			<button
				className={"launcher app"}
				name={wp.name}
				tooltip_text={wp.name}
				on_clicked={() => {
					execAsync(`swww img "${wp.originalPath}"`);
					App.toggle_window("wallpapers");
				}}
				widthRequest={winwidth(0.1)}
				heightRequest={winheight(0.1)}
				halign={Gtk.Align.CENTER}
				valign={Gtk.Align.CENTER}
			>
				<box
					className={"wallpaper image"}
					halign={Gtk.Align.FILL}
					valign={Gtk.Align.FILL}
					css={`
						background-image: url("${cachedImagePath}");
						background-size: cover;
						background-repeat: no-repeat;
						border-radius: 3rem;
					`}
				/>
			</button>
		);
		grid.attach(wpButton, index % columnCount, Math.floor(index / columnCount), 1, 1);
	}

	return grid;
}

async function updateWallpaperGrid(wallpaperGrid, wallpapers) {
	const sortedWallpapers = wallpapers.sort((a, b) => a.name.localeCompare(b.name));

	wallpaperGrid.get_children().forEach((child) => {
		wallpaperGrid.remove(child);
	});

	for (const [index, wp] of sortedWallpapers.entries()) {
		const cachedImagePath = await getCachedImagePath(wp.originalPath, winwidth(0.05), winheight(0.05));

		const wpButton = (
			<button
				className={"launcher app"}
				name={wp.name}
				tooltip_text={wp.name}
				on_clicked={() => {
					execAsync(`swww img "${wp.originalPath}"`);
					App.toggle_window("wallpapers");
				}}
				widthRequest={winwidth(0.1)}
				heightRequest={winheight(0.1)}
				halign={Gtk.Align.CENTER}
				valign={Gtk.Align.CENTER}
			>
				<box
					className={"wallpaper image"}
					halign={Gtk.Align.FILL}
					valign={Gtk.Align.FILL}
					css={`
						background-image: url("${cachedImagePath}");
						background-size: cover;
						background-repeat: no-repeat;
						border-radius: 3rem;
					`}
				/>
			</button>
		);

		wallpaperGrid.attach(wpButton, index % columnCount, Math.floor(index / columnCount), 1, 1);
	}

	wallpaperGrid.show_all();
}

function createRefreshButton(wallpaperGrid) {
	const theSpinner = new Spinner({
		halign: Gtk.Align.CENTER,
		valign: Gtk.Align.CENTER,
		visible: false,
	});

	const handleClick = () => {
		execAsync(`notify-send "Refreshing" "Starting wallpaper refresh process."`);
		console.log("Refresh button clicked.");

		theButton.hide();
		theSpinner.show();
		theSpinner.start();

		execAsync(`${SRC}/scripts/refresh_wallpapers.sh`)
			.then(() => {
				execAsync(`notify-send "Refreshing" "Wallpaper refresh completed successfully."`);
				console.log("Wallpaper refresh script executed successfully.");
				return getWallpapers();
			})
			.then((wps) => {
				console.log(`Fetched ${wps.length} wallpapers after refresh.`);
				updateWallpaperGrid(wallpaperGrid, wps);
			})
			.catch((error) => {
				console.error(`Error refreshing wallpapers: ${error.message}`);
				execAsync(`notify-send "Error" "Wallpaper refresh failed: ${error.message}"`);
			})
			.finally(() => {
				theSpinner.stop();
				theSpinner.hide();
				theButton.show();
				execAsync(`notify-send "Refreshing" "Refresh process ended."`);
				console.log("Refresh process completed.");
			});
	};

	const theButton = (
		<button className={"refresh button"} tooltip_text={"Refresh Wallpapers"} on_clicked={handleClick} halign={Gtk.Align.START} valign={Gtk.Align.START}>
			<icon icon={Icon.ui.refresh} />
		</button>
	);

	const container = (
		<box hexpand={false} vexpand={false} halign={Gtk.Align.CENTER} valign={Gtk.Align.CENTER}>
			{theSpinner}
			{theButton}
		</box>
	);

	return container;
}

async function createScrollablePage(wps) {
	const wallpaperGrid = await createWallpaperGrid(wps);
	const refreshButton = createRefreshButton(wallpaperGrid);
	return (
		<box css="background-color: rgba(0,0,0,0.75); border: 2px solid rgba(15,155,255,1); border-radius: 3rem; padding: 1rem;">
			<scrollable
				vscroll={Gtk.PolicyType.AUTOMATIC}
				hscroll={Gtk.PolicyType.NEVER}
				vexpand={true}
				hexpand={true}
				halign={Gtk.Align.FILL}
				valign={Gtk.Align.FILL}
				visible={true}
				widthRequest={winwidth(0.35)}
				heightRequest={winheight(0.35)}
			>
				{wallpaperGrid}
			</scrollable>
			{refreshButton}
		</box>
	);
}

export default async function () {
	const wallpaperGrid = new Grid({
		hexpand: true,
		vexpand: true,
		halign: Gtk.Align.FILL,
		valign: Gtk.Align.FILL,
		visible: true,
	});

	const wps = await getWallpapers();
	const gridContent = await createScrollablePage(wps);
	wallpaperGrid.attach(gridContent, 1, 1, 1, 1);

	wallpaperGrid.attach(ClickToClose(1, 0.25, 0.25, "wallpapers"), 0, 0, 3, 1); // Top
	wallpaperGrid.attach(ClickToClose(2, 0.25, 0.25, "wallpapers"), 0, 1, 1, 1); // Left
	wallpaperGrid.attach(ClickToClose(3, 0.25, 0.25, "wallpapers"), 2, 1, 1, 1); // Right
	wallpaperGrid.attach(ClickToClose(4, 0.25, 0.25, "wallpapers"), 0, 2, 3, 1); // Bottom

	const window = (
		<window
			name="wallpapers"
			className="wallpapers window"
			anchor={Astal.WindowAnchor.TOP | Astal.WindowAnchor.BOTTOM | Astal.WindowAnchor.LEFT | Astal.WindowAnchor.RIGHT}
			layer={Astal.Layer.OVERLAY}
			exclusivity={Astal.Exclusivity.NORMAL}
			keymode={Astal.Keymode.EXCLUSIVE}
			visible={false}
			application={App}
			onKeyPressEvent={(_, event) => {
				const win = App.get_window("wallpapers");
				if (event.get_keyval()[1] === Gdk.KEY_Escape && win?.visible) {
					win.visible = false;
				}
			}}
		>
			{wallpaperGrid}
		</window>
	);

	return window;
}
