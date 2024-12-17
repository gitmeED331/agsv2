#!/usr/bin/gjs -m

/*
Many thanks to Kotontrion (https://github.com/kotontrion) for all the assistance and inspiration
*/

import "../globals";
import { Astal, App, Gtk, Gdk, astalify } from "astal/gtk3";
import { bind, Variable, timeout, GLib } from "astal";
import Lock from "gi://GtkSessionLock";
import AstalAuth from "gi://AstalAuth";
import AstalMpris from "gi://AstalMpris";
import { Grid, Fixed, RegularWindow } from "../modules/Astalified/index";

/* Widgets */
import Controls from "./Controls";
import { BatteryButton, BluetoothButton, VolumeIndicator, NetworkButton } from "../modules/Widgets/index";
import Player from "./MediaPlayer";
import Clock from "./clock";

import lockstyle from "./style/Lockscreen.scss";
import { winheight, winwidth } from "../modules/lib/screensizeadjust";

const background = "windows-failure.jpg";
const player = AstalMpris.Player.new("spotify");
const pam = new AstalAuth.Pam();
const prompt = Variable("");
const inputVisible = Variable(true);
const inputNeeded = Variable(true);
const UIVisibility = Variable(true);

function authMessages() {
	const messageLabel = (msg, type) => {
		return <label label={msg.toString()} wrap={true} halign={CENTER} valign={CENTER} />;
	};
	const box = <box halign={CENTER} valign={CENTER} />;
	pam.connect("auth-error", (auth, msg) => {
		(box as Gtk.Box).add(messageLabel(msg, "auth-error"));
		box.show_all();
	});
	pam.connect("auth-info", (auth, msg) => {
		(box as Gtk.Box).add(messageLabel(msg, "auth-info"));
		box.show_all();
	});
	pam.connect("fail", (auth, msg) => {
		(box as Gtk.Box).add(messageLabel(msg, "fail"));
		box.show_all();
	});
	// pam.connect("success", (auth, msg) => {
	//     (box as Gtk.Box).add(messageLabel(msg, "success"));
	//     box.show_all();
	// });
	return box;
}

const PasswordEntry = (
	<entry
		className={"password"}
		placeholder_text={"Enter your password..."}
		visibility={false}
		onActivate={(self) => {
			if (self.get_text().length === 0) {
				inputNeeded.set(true);
				prompt.set("Password Required, try again.");
				return;
			} else if (self.get_text().length > 0) {
				inputNeeded.set(false);
				pam.supply_secret(self.text);
				self.text = "";
			}
		}}
		hexpand={true}
		halign={CENTER}
		valign={CENTER}
		onRealize={(self) => self.grab_focus()}
	/>
);

function loginGrid() {
	const promptLabel = <label label={bind(prompt).as((p) => p.toUpperCase())} halign={CENTER} valign={CENTER} visible={bind(inputNeeded)} />;

	const passwordPrompt = (
		<box vertical spacing={10}>
			{[promptLabel, PasswordEntry]}
		</box>
	);

	const currentUser = <label className={"username"} label={bind(pam, "username").as((u) => u.toUpperCase())} halign={CENTER} valign={CENTER} />;

	const currentDesktop = <label className={"desktop"} label={GLib.getenv("XDG_CURRENT_DESKTOP") ? GLib.getenv("XDG_CURRENT_DESKTOP")?.toUpperCase() : ""} halign={CENTER} valign={CENTER} />;

	const grid = (
		<Grid
			className={"logingrid"}
			halign={CENTER}
			valign={CENTER}
			expand
			rowSpacing={15}
			visible={true}
			setup={(self) => {
				self.attach(currentUser, 0, 0, 1, 1);
				self.attach(currentDesktop, 0, 1, 1, 1);
				self.attach(passwordPrompt, 0, 2, 1, 1);
				self.attach(authMessages(), 0, 3, 1, 1);
			}}
		/>
	);

	return grid;
}

const topRightGrid = (
	<Grid
		className={"topright"}
		halign={END}
		valign={START}
		hexpand={true}
		vexpand={true}
		visible={true}
		columnSpacing={10}
		setup={(self) => {
			self.attach(VolumeIndicator(), 0, 0, 1, 1);
			self.attach(NetworkButton(), 1, 0, 1, 1);
			self.attach(BluetoothButton(), 2, 0, 1, 1);
			self.attach(BatteryButton(), 3, 0, 1, 1);
		}}
	/>
);

function Lockscreen({ monitor }: { monitor: Gdk.Monitor }) {
	const overlayBox = (
		<box halign={FILL} valign={FILL} expand vertical>
			<centerbox halign={FILL} valign={START} expand>
				{Controls()}
				{Clock()}
				{topRightGrid}
			</centerbox>
			<Player player={player} />
		</box>
	);

	const tsxFixed = (
		<Fixed
			expand
			visible={true}
			widthRequest={250}
			heightRequest={500}
			setup={(self) => {
				self.put(loginGrid(), winwidth(0.41), winheight(0.2));
				// self.put(loginGrid(), 250, 400);
			}}
		/>
	);

	return (
		<RegularWindow
			name={`lockscreen-${monitor}`}
			className={"lockscreen"}
			visible={false}
			halign={FILL}
			valign={FILL}
			application={App}
			expand
			resizable={false}
			decorated={false}
			css={`
				background-image: url("../assets/${background}");
				background-repeat: no-repeat;
				background-position: center;
				background-size: cover;
			`}
			onKeyPressEvent={(_, event) => {
				if (event.get_keyval()[1] === Gdk.KEY_Escape) {
					UIVisibility.set(!UIVisibility.get());
					if (UIVisibility.get() === true) {
						PasswordEntry.grab_focus();
					}
				}
			}}
		>
			<overlay visible={bind(UIVisibility)} passThrough={true} clickThrough={true} halign={FILL} valign={FILL} expand>
				{overlayBox}
				{tsxFixed}
			</overlay>
		</RegularWindow>
	)
}

const windows: { window: Gtk.Window; monitor: Gdk.Monitor }[] = [];

function createWindow(monitor: Gdk.Monitor): { window: Gtk.Window; monitor: Gdk.Monitor } {
	const window = Lockscreen({ monitor });
	const win = { window: window as Gtk.Window, monitor };
	windows.push(win);
	return win;
}

function startLock() {
	const display = Gdk.Display.get_default();
	// @ts-expect-error
	for (let m = 0; m < display?.get_n_monitors(); m++) {
		const monitor = display?.get_monitor(m);
		if (monitor) {
			createWindow(monitor);
		}
	}
	display?.connect("monitor-added", (ds, monitor) => {
		if (monitor) {
			const w = createWindow(monitor);
			sessionLock.new_surface(w.window, w.monitor);
			w.window.show();
		}
	});
	sessionLock.lock_lock();
	windows.map((w) => {
		sessionLock.new_surface(w.window, w.monitor);
		w.window.show();
	});
}
pam.connect("auth-prompt-visible", (auth, msg) => {
	prompt.set(msg);
	inputVisible.set(true);
	inputNeeded.set(true);
});

pam.connect("auth-prompt-hidden", () => {
	inputVisible.set(false);
	inputNeeded.set(false);
});
function unlock() {
	timeout(500, () => {
		sessionLock.unlock_and_destroy();
		windows.forEach((w) => w.window.destroy());
		Gdk.Display.get_default()?.sync();
		App.quit();
	});
}

pam.connect("success", unlock);

pam.connect("fail", () => {
	pam.start_authenticate();
});

const sessionLock = Lock.prepare_lock();
sessionLock.connect("locked", () => {
	pam.start_authenticate();
	prompt.set("Locked!");
});

function finished() {
	sessionLock.destroy();
	windows.forEach((w) => w.window.destroy());
	Gdk.Display.get_default()?.sync();
	App.quit();
}

sessionLock.connect("finished", finished);

App.connect("activate", () => {
	startLock();
});

App.start({
	instanceName: "lockscreen",
	css: lockstyle,
	requestHandler(request: string, resp: (response: any) => void) {
		if (request == "UITrigger") {
			UIVisibility.set(!UIVisibility.get());
			resp("UI Visibility set to true");
		}
	},
});
