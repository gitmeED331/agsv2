/**
 * MIT License
 *
 * Copyright (c) 2024 TopsyKrets
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction...
 *
 */

import { Astal, Gtk, Gdk, App } from "astal/gtk4";
import { bind, execAsync, GLib } from "astal";
import AstalApps from "gi://AstalApps";
import Pango from "gi://Pango";
import Icon from "../../lib/icons";
import { winwidth, winheight } from "../../lib/screensizeadjust";
import { Stack, Grid } from "../../Astalified/index";
import Calculator from "./Calculator";
import ClickToClose from "../../lib/ClickToClose";
import terminal from "./Terminal";

const Apps = new AstalApps.Apps({
	nameMultiplier: 2,
	entryMultiplier: 0,
	executableMultiplier: 2,
});

const Applications = Apps.get_list();
const background = `${SRC}/assets/groot-thin-right.png`;

function createAppGrid(appList) {
	const columnCount = 1;
	appList = appList.sort((a, b) => a.get_name().localeCompare(b.get_name()));

	const grid = <Grid hexpand={true} vexpand={true} halign={Gtk.Align.FILL} valign={Gtk.Align.FILL} visible={true} />;

	appList.forEach((app, index) => {
		const appButton = (
			<button
				cssClasses={"launcher app"}
				name={app.get_name()}
				tooltip_text={app.get_description()}
				onClicked={() => {
					app.launch();
					App.toggle_window("launcher");
				}}
				onKeyPressed={(_, event) => {
					if (event.get_keyval() === Gdk.KEY_Return) {
						app.launch();
						App.toggle_window("launcher");
					}
				}}
			>
				<box vertical={false} halign={Gtk.Align.FILL} valign={Gtk.Align.FILL} spacing={5} widthRequest={winwidth(0.15)}>
					<icon icon={bind(app, "icon_name").as((i) => i) || app.get_icon_name() || Icon.missing} halign={Gtk.Align.CENTER} valign={Gtk.Align.CENTER} />
					<label label={app.get_name()} halign={Gtk.Align.CENTER} valign={Gtk.Align.CENTER} ellipsize={Pango.EllipsizeMode.END} maxWidthChars={30} lines={1} wrap={true} />
				</box>
			</button>
		);
		grid.attach(appButton, index % columnCount, Math.floor(index / columnCount), 1, 1);
	});

	return grid;
}

const createScrollablePage = (appList) => (
	<scrollable
		visible={true}
		vscroll={Gtk.PolicyType.AUTOMATIC}
		hscroll={Gtk.PolicyType.NEVER}
		vexpand={true}
		hexpand={true}
		halign={Gtk.Align.FILL}
		valign={Gtk.Align.FILL}
		heightRequest={winheight(0.9)}
		css={`
			padding: 1rem;
		`}
	>
		{createAppGrid(appList)}
	</scrollable>
);

const handleCalculatorCommand = (query, self) => {
	const expression = query.slice(6).trim();

	if (expression) {
		const existingChild = theStack.get_visible_child();
		if (existingChild && theStack.get_visible_child_name() === "calculator") {
			theStack.remove(existingChild);
		}

		const calculatorPage = (
			<Grid name="calculator" columnSpacing={10} rowSpacing={10}>
				<Calculator expression={expression} />
			</Grid>
		);

		theStack.add_named(calculatorPage, "calculator");
		theStack.set_visible_child_name("calculator");
	}
};

let currentQuery = "";
const entry = (
	<entry
		cssClasses="launcher search"
		placeholder_text="Search apps, TERM:: for terminal commands, CALC:: for calculator..."
		onChanged={(self) => {
			const query = self.get_text().trim();
			currentQuery = query;
			if (query.startsWith("CALC::")) {
				theStack.set_visible_child_name("calculator");
			} else if (!query.startsWith("TERM::") && !query.startsWith("CALC::")) {
				Search(query);
			}
		}}
		onKeyPressed={(self, event) => {
			const keyval = event.get_keyval();
			const state = event.get_state();
			const query = currentQuery.trim();

			if (keyval === Gdk.KEY_Return || keyval === Gdk.KEY_KP_Enter) {
				switch (true) {
					case query.startsWith("TERM::"):
						handleTerminalCommand(query, state, self);
						break;
					case query.startsWith("CALC::"):
						handleCalculatorCommand(query, self);
						theStack.set_visible_child_name("calculator");
						break;
					default:
						break;
				}
			}
		}}
		hexpand={true}
		vexpand={false}
		halign={Gtk.Align.FILL}
		valign={Gtk.Align.CENTER}
		tooltip_text={"Search applications, or use TERM:: for terminal commands, CALC:: for calculator"}
		focusOnClick={true}
		primary_icon_name={Icon.launcher.search}
		secondary_icon_name={Icon.launcher.clear}
	/>
);

entry.connect("icon-press", () => {
	entry.set_text("");
	theStack.set_visible_child_name("All Apps");
});

const theStack = (
	<Stack
		cssClasses={"launcher stack"}
		transitionDuration={300}
		transitionType={Gtk.StackTransitionType.SLIDE_LEFT_RIGHT}
		halign={Gtk.Align.FILL}
		valign={Gtk.Align.FILL}
		hhomogeneous={true}
		vhomogeneous={false}
		visible={true}
		hexpand={false}
		vexpand={true}
	/>
);

const Switcher = () => {
	const handleSwitch = (name) => {
		theStack.set_visible_child_name(name);
		query = "";
		entry.set_text("");
	};

	const allAppsButton = (
		<button
			cssClasses={bind(theStack, "visible_child_name").as((name) => (name === "All Apps" ? "active" : ""))}
			onClicked={(_, event) => {
				if (event.button === Gdk.BUTTON_PRIMARY) {
					handleSwitch("All Apps");
				}
			}}
			tooltip_text={"All Apps"}
		>
			<icon icon={Icon.launcher.allapps} />
		</button>
	);

	const terminalButton = (
		<button
			cssClasses={bind(theStack, "visible_child_name").as((name) => (name === "terminal" ? "active" : ""))}
			onClicked={(_, event) => {
				if (event.button === Gdk.BUTTON_PRIMARY) {
					handleSwitch("Terminal");
				}
			}}
			tooltip_text={"Terminal"}
		>
			<icon icon={Icon.launcher.hyprland} />
		</button>
	);
	return (
		<box cssClasses={"launcher switcher"} vertical halign={Gtk.Align.CENTER} valign={Gtk.Align.FILL}>
			{[allAppsButton, terminalButton]}
		</box>
	);
};

function Launcher({ monitor }: { monitor: number }) {
	const contentGrid = (
		<Grid
			cssClasses={"launcher contentgrid"}
			halign={Gtk.Align.FILL}
			valign={Gtk.Align.FILL}
			hexpand={true}
			vexpand={true}
			visible={true}
			css={`
				background-image: url("${background}");
				background-size: contain;
				background-repeat: no-repeat;
				background-position: center;
				background-color: rgba(0, 0, 0, 1);
			`}
		/>
	);

	contentGrid.attach(entry, 0, 0, 2, 1);
	contentGrid.attach(Switcher(), 0, 1, 1, 1);
	contentGrid.attach(theStack, 1, 1, 1, 1);

	const masterGrid = <Grid cssClasses={"launcher containergrid"} halign={Gtk.Align.FILL} valign={Gtk.Align.FILL} hexpand={true} vexpand={true} visible={true} />;

	masterGrid.attach(contentGrid, 1, 1, 1, 1);
	masterGrid.attach(ClickToClose(1, 0.8, 0.8, "launcher"), 2, 1, 1, 1);

	return (
		<window
			name={"launcher"}
			cssClasses={"launcher window"}
			anchor={Astal.WindowAnchor.TOP | Astal.WindowAnchor.BOTTOM | Astal.WindowAnchor.LEFT | Astal.WindowAnchor.RIGHT}
			layer={Astal.Layer.OVERLAY}
			exclusivity={Astal.Exclusivity.NORMAL}
			keymode={Astal.Keymode.ON_DEMAND}
			visible={false}
			application={App}
			onKeyPressed={(_, event) => {
				const win = App.get_window("launcher");
				if (event.get_keyval() === Gdk.KEY_Escape) {
					if (win && win.visible === true) {
						query = "";
						win.visible = false;
					}
				}
			}}
		>
