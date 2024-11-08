#!/usr/bin/gjs -m

/**
 * MIT License
 *
 * Copyright (c) 2024 TopsyKrets
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction...
 */

import { Astal, App, Gtk, Gdk } from "astal/gtk4";
import { execAsync, bind, Variable, timeout, GLib } from "astal";
import Lock from "gi://GtkSessionLock";
import AstalAuth from "gi://AstalAuth";
import AstalMpris from "gi://AstalMpris";
import { Grid, Fixed } from "../modules/Astalified/index";

/* Widgets */
import Controls from "./Controls";
import { BatteryButton, BluetoothButton, VolumeIndicator, NetworkButton } from "../modules/Widgets/index";
import Player from "./MediaPlayer";
import Clock from "./clock";

import lockstyle from "./style/Lockscreen.scss";

const player = AstalMpris.Player.new("Deezer");
const pam = new AstalAuth.Pam();
const prompt = Variable("");
const inputVisible = Variable(true);
const inputNeeded = Variable(true);

function authMessages() {
	const messageLabel = (msg, type) => {
		return <label label={msg.toString()} wrap={true} halign={Gtk.Align.CENTER} valign={Gtk.Align.CENTER} />;
	};
	const box = <box halign={Gtk.Align.CENTER} valign={Gtk.Align.CENTER} />;
	pam.connect("auth-error", (auth, msg) => {
		box.append(messageLabel(msg, "auth-error"));
	});
	pam.connect("auth-info", (auth, msg) => {
		box.append(messageLabel(msg, "auth-info"));
	});
	pam.connect("fail", (auth, msg) => {
		box.append(messageLabel(msg, "fail"));
	});
	return box;
}

function loginGrid() {
	const promptLabel = <label label={bind(prompt).as((p) => p.toUpperCase())} halign={Gtk.Align.CENTER} valign={Gtk.Align.CENTER} visible={bind(inputNeeded)} />;

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
			halign={Gtk.Align.CENTER}
			valign={Gtk.Align.CENTER}
			onRealize={(self) => self.grab_focus()}
		/>
	);
	const passwordPrompt = (
		<box vertical spacing={10}>
			{[promptLabel, PasswordEntry]}
		</box>
	);

	const currentUser = <label className={"username"} label={bind(pam, "username").as((u) => u.toUpperCase())} halign={Gtk.Align.CENTER} valign={Gtk.Align.CENTER} />;

	const currentDesktop = <label className={"desktop"} label={GLib.getenv("XDG_CURRENT_DESKTOP")?.toUpperCase() || ""} halign={Gtk.Align.CENTER} valign={Gtk.Align.CENTER} />;

	const grid = <Grid className={"logingrid"} halign={Gtk.Align.CENTER} valign={Gtk.Align.CENTER} hexpand={true} vexpand={true} rowSpacing={15} visible={true} />;

	grid.attach(currentUser, 0, 0, 1, 1);
	grid.attach(currentDesktop, 0, 1, 1, 1);
	grid.attach(passwordPrompt, 0, 2, 1, 1);
	grid.attach(authMessages(), 0, 3, 1, 1);

	return grid;
}

function topRightGrid() {
	const grid = new Grid({
		halign: Gtk.Align.END,
		valign: Gtk.Align.START,
		hexpand: true,
		vexpand: true,
		visible: true,
		columnSpacing: 10,
	});

	grid.attach(VolumeIndicator(), 0, 0, 1, 1);
	grid.attach(NetworkButton(), 1, 0, 1, 1);
	grid.attach(BluetoothButton(), 2, 0, 1, 1);
	grid.attach(BatteryButton(), 3, 0, 1, 1);

	return (
		<box className={"topright"} vertical={false} hexpand={true} spacing={5} halign={Gtk.Align.END} valign={Gtk.Align.START} visible={true}>
			{grid}
		</box>
	);
}

function Lockscreen({ monitor }: { monitor: number }) {
	const overlayBox = (
		<box halign={Gtk.Align.FILL} valign={Gtk.Align.FILL} hexpand={true} vexpand={true} vertical>
			<centerbox halign={Gtk.Align.FILL} valign={Gtk.Align.START} hexpand={true} vexpand={true}>
				{Controls()}
				{Clock()}
				{topRightGrid()}
			</centerbox>
			<Player player={player} />
		</box>
	);

	const tsxFixed = <Fixed hexpand={true} vexpand={true} visible={true} widthRequest={250} heightRequest={500} />;
	tsxFixed.put(loginGrid(), 250, 400);

	return (
		<window
			name={`lockscreen-${monitor}`}
			className={"lockscreen"}
			anchor={Astal.WindowAnchor.TOP | Astal.WindowAnchor.BOTTOM | Astal.WindowAnchor.LEFT | Astal.WindowAnchor.RIGHT}
			exclusivity={Astal.Exclusivity.IGNORE}
			keymode={Astal.Keymode.EXCLUSIVE}
			visible={false}
			application={App}
			monitor={monitor}
			clickThrough={false}
		>
			<overlay visible={true} passThrough={true} clickThrough={true} halign={Gtk.Align.FILL} valign={Gtk.Align.FILL} hexpand={true} vexpand={true}>
				{overlayBox}
				{tsxFixed}
			</overlay>
		</window>
	);
}

const windows: { window: Gtk.Window; monitor: any }[] = [];

function createWindow(monitor) {
	const window = Lockscreen({ monitor }) as Gtk.Window;
	const win = { window, monitor };
	windows.push(win);
	return win;
}

function startLock() {
	const display = Gdk.Display.get_default();
	for (let m = 0; m < display?.get_n_monitors(); m++) {
		const monitor = display?.get_monitor(m);
		createWindow(monitor);
	}
	display?.connect("monitor-added", (disp, monitor) => {
		const w = createWindow(monitor);
		sessionLock.new_surface(w.window, w.monitor);
		w.window.show();
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
pam.connect("fail", () => pam.start_authenticate());

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
});
