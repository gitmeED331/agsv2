/**
 * MIT License
 *
 * Copyright (c) 2024 TopsyKrets
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction...
 *
 */

import { Astal, App, Gtk, Gdk } from "astal/gtk3";
import { bind, execAsync, exec, Variable, timeout, idle } from "astal";
import AstalAuth from "gi://AstalAuth";
import Lock from "gi://GtkSessionLock";
import AstalMpris from "gi://AstalMpris";
import { Grid } from "../modules/Astalified/index";
import Controls from "./Controls";
import { BatteryButton, BluetoothButton, VolumeIndicator, NetworkButton } from "../modules/Widgets/index";
import Player from "./MediaPlayer";
import { Box } from "../../../../../usr/share/astal/gjs/gtk3/widget";

const prompt = Variable("");
const inputVisible = Variable(false);
const inputNeeded = Variable(false);

const auth = new AstalAuth.Pam();

const Notif = (msg, type) => {
	const notif = (
		<box className={`auth-notif ${type}`}>
			<label label={msg} maxWidthChars={25} wrap={true} />
		</box>
	);

	const revealer = (
		<revealer halign={Gtk.Align.END} transitionType={Gtk.RevealerTransitionType.SLIDE_LEFT} transitionDuration={250} revealChild={false}>
			{notif}
		</revealer>
	);

	timeout(20000, () => {
		revealer.revealChild = false;
		timeout(revealer.transitionDuration, () => {
			revealer.destroy();
		});
	});
	idle(() => {
		revealer.revealChild = true;
	});
	return revealer;
};
function authBoxSetup(box) {
	auth.connect("auth-error", (_, msg) => {
		if (!msg) return;
		box.add(Notif(msg, "error"));
		box.show_all();
		auth.supply_secret(null);
	});

	auth.connect("auth-info", (_, msg) => {
		if (!msg) return;
		box.add(Notif(msg, "info"));
		box.show_all();
		auth.supply_secret(null);
	});

	auth.connect("fail", (_, msg) => {
		if (!msg) return;
		box.add(Notif(msg, "fail"));
		box.show_all();
	});
}

function AuthNotifs() {
	const an = <box halign={Gtk.Align.END} valign={Gtk.Align.START} vertical setup={authBoxSetup} />;

	return an;
}

auth.connect("auth-prompt-visible", (auth, msg) => {
	prompt.setValue(msg);
	inputVisible.setValue(true);
	inputNeeded.setValue(true);
});
auth.connect("auth-prompt-hidden", (auth, msg) => {
	prompt.setValue(msg);
	inputVisible.setValue(false);
	inputNeeded.setValue(true);
});

auth.connect("success", unlock);
auth.connect("fail", (p, msg) => {
	auth.start_authenticate();
});

const lock = Lock.prepare_lock();

const windows = [];

function unlock() {
	for (const win of windows) {
		win.window.child.children[0].reveal_child = false;
	}
	timeout(500, () => {
		lock.unlock_and_destroy();
		windows.forEach((w) => w.window.destroy());
		Gdk.Display.get_default()?.sync();
		App.quit();
	});
}

const Right = () =>
	Widget.Box({
		hpack: "end",
		children: [Clock()],
	});

const Left = () =>
	Widget.Box({
		children: [SessionBox()],
	});

const Bar = () =>
	Widget.CenterBox({
		start_widget: Left(),
		end_widget: Right(),
	});

function LoginBox() {
	return (
		<box vertical halign={Gtk.Align.CENTER} valign={Gtk.Align.CENTER} spacing={16}>
			<box className={"avatar"} halign={Gtk.Align.START} />
			<box className={bind(inputNeeded).as((n) => `entry-box ${n ? "" : "hidden"}`)} vertical>
				<label label={bind(prompt)} />
				<entry
					halign={Gtk.Align.CENTER}
					xalign={0.5}
					visibility={bind(inputVisible)}
					sensitive={bind(inputNeeded)}
					on_activate={(_, self) => {
						inputNeeded.setValue(false);
						auth.supply_secret(self.text);
						self.text = "";
					}}
					on_Realize={(entry) => entry.grab_focus()}
				/>
			</box>
		</box>
	);
}

function LockWindow() {
	return (
		<window>
			<box>
				<revealer revealChild={false} transitionType={Gtk.RevealerTransitionType.CROSSFADE} transitionDuration={500}>
					<box className={"lock-container"} vertical>
						Bar(), LoginBox(), SessionBoxTooltip(), MprisCorner(), AuthNotifs(),
					</box>
				</revealer>
			</box>
		</window>
	);
}

function createWindow(monitor) {
	const window = LockWindow();
	const win = { window, monitor };
	windows.push(win);
	return win;
}

function lock_screen() {
	const display = Gdk.Display.get_default();
	for (let m = 0; m < display?.get_n_monitors(); m++) {
		const monitor = display?.get_monitor(m);
		createWindow(monitor);
	}
	display?.connect("monitor-added", (disp, monitor) => {
		const w = createWindow(monitor);
		lock.new_surface(w.window, w.monitor);
		w.window.show();
	});
	lock.lock_lock();
	windows.map((w) => {
		lock.new_surface(w.window, w.monitor);
		w.window.show();
	});
}

function on_finished() {
	lock.destroy();
	windows.forEach((w) => w.window.destroy());
	Gdk.Display.get_default()?.sync();
	App.quit();
}

// lock.connect("locked", on_locked);
lock.connect("finished", on_finished);
lock_screen();
auth.start_authenticate();
