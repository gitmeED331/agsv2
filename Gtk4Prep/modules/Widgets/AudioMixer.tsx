/**
 * MIT License
 *
 * Copyright (c) 2024 TopsyKrets
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction...
 *
 */

import { Astal, Gtk, Gdk, App } from "astal/gtk3";
import { bind, execAsync, GLib, Variable } from "astal";
import Icon from "../lib/icons";
import AstalWp from "gi://AstalWp";
import Pango from "gi://Pango";

const { audio } = AstalWp.get_default();
const Speaker = audio.get_default_speaker();
const Microphone = audio.get_default_microphone();

function DeviceIdentifier({ device }) {
	const tooltipText = Variable.derive([bind(device, "volume"), bind(device, "mute")], (volume, isMuted) => (isMuted ? "Muted" : `Volume ${(volume * 100).toFixed(2)}%`));
	const cssClasses = Variable.derive([bind(device, "mute")], (isMuted) => {
		const classList = ["audio-mixer", "volume-indicator"];
		if (isMuted) {
			classList.push("muted");
		}
		return classList.join(" ");
	});

	return (
		<button
			cssClasses={bind(cssClasses)}
			tooltip_text={bind(tooltipText)}
			onClick={(_, event) => {
				if (event.button === Gdk.BUTTON_PRIMARY) {
					device?.set_mute(!device?.get_mute());
				}
			}}
			onScroll={(_, { delta_y }) => {
				if (delta_y < 0) {
					device?.set_volume(device.volume + 0.05);
					device?.set_mute(false);
				} else {
					device?.set_volume(device.volume - 0.05);
					device?.set_mute(false);
				}
			}}
		>
			<icon icon={bind(device, "volume_icon")} />
		</button>
	);
}

function DeviceSlider({ device }) {
	return (
		<slider
			cssClasses={`audio-mixer ${device}-slider Slider`}
			halign={Gtk.Align.CENTER}
			valign={Gtk.Align.CENTER}
			vexpand={true}
			drawValue={false}
			min={0}
			max={device === Speaker ? 1.5 : 1}
			value={bind(device, "volume")}
			onDragged={({ value, dragging }) => {
				if (dragging) {
					device?.set_volume(value);
					device?.set_mute(false);
				}
			}}
		/>
	);
}

function DeviceControlGroup({ devices }) {
	return (
		<box cssClasses={"audio-mixer devices"} vertical={true} vexpand={true} spacing={10} valign={Gtk.Align.CENTER} halign={Gtk.Align.CENTER}>
			{devices.map((device) => (
				<box spacing={5} key={device.id}>
					<DeviceIdentifier device={device} />
					<DeviceSlider device={device} />
				</box>
			))}
		</box>
	);
}

function AppMixerItem({ stream }) {
	const cssClasses = Variable.derive([bind(stream, "mute")], (isMuted) => {
		const classList = ["audio-mixer", "item"];
		if (isMuted) {
			classList.push("muted");
		}
		return classList.join(" ");
	});
	const mixerLabel = (
		<button
			cssClasses={bind(cssClasses)}
			onClick={(_, event) => {
				if (event.button === Gdk.BUTTON_PRIMARY) {
					stream?.set_mute(!stream?.get_mute());
				}
			}}
			onScroll={(_, { delta_y }) => {
				if (delta_y < 0) {
					stream?.set_volume(stream.volume + 0.05);
					stream?.set_mute(false);
				} else {
					stream?.set_volume(stream.volume - 0.05);
					stream?.set_mute(false);
				}
			}}
		>
			<box spacing={5} vertical={false} valign={Gtk.Align.CENTER}>
				<icon valign={Gtk.Align.START} tooltip_text={bind(stream, "description").as((n) => n || "")} icon={bind(stream, "icon").as((n) => n || Icon.audio.type.speaker)} />
				<label valign={Gtk.Align.CENTER} xalign={0} ellipsize={Pango.EllipsizeMode.END} max_width_chars={28} label={bind(stream, "description").as((d) => d || "")} />
			</box>
		</button>
	);
	const streamSlider = (
		<slider
			cssClasses={"audio-mixer item Slider"}
			halign={Gtk.Align.CENTER}
			valign={Gtk.Align.CENTER}
			hexpand={true}
			draw_value={false}
			value={bind(stream, "volume")}
			onDragged={({ value }) => {
				stream.volume = value;
			}}
		/>
	);
	return (
		<box cssClasses={"audio-mixer item"} visible={true} hexpand={false} halign={Gtk.Align.CENTER} vertical={true} spacing={2}>
			{[mixerLabel, streamSlider]}
		</box>
	);
}

function SettingsButton() {
	return (
		<button
			cssClasses={"audio-mixer settings-button"}
			onClicked={() => {
				execAsync("pavucontrol");
				App.toggle_window("dashboard");
			}}
			hexpand={true}
			halign={Gtk.Align.END}
			valign={Gtk.Align.START}
		>
			<icon icon={Icon.ui.settings} />
		</button>
	);
}

export default function AudioMixer() {
	const getStreams = audio.get_streams();
	const activeStreams = (
		<box vertical={true}>
			<label cssClasses={"audio-mixer header"} label={"Active Audio Streams"} visible={getStreams.length > 0} />
			{bind(audio, "streams").as((getStreams) => (getStreams.length > 0 ? getStreams.map((stream, index) => <AppMixerItem key={index} stream={stream} />) : <label label="No Active Audio Streams" />))}
		</box>
	);
	return (
		<box vertical={true} cssClasses={"audio-mixer container"} spacing={10} hexpand={false}>
			<label cssClasses={"header"} label={"Audio Devices & Streams"} halign={Gtk.Align.CENTER} />
			<DeviceControlGroup devices={[Speaker, Microphone]} />
			{activeStreams}
			<SettingsButton />
		</box>
	);
}
