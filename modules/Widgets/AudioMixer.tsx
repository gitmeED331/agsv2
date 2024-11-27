import { Gdk, App } from "astal/gtk3";
import { bind, execAsync, Variable } from "astal";
import Icon from "../lib/icons";
import AstalWp from "gi://AstalWp";
import Pango from "gi://Pango";

function DeviceIdentifier({ device }: any) {
	const tooltipText = Variable.derive([bind(device, "volume"), bind(device, "mute")], (volume, isMuted) => (isMuted ? "Muted" : `Volume ${(volume * 100).toFixed(2)}%`));
	const classname = Variable.derive([bind(device, "mute")], (isMuted) => {
		const classList = ["audio-mixer", "volume-indicator"];
		if (isMuted) {
			classList.push("muted");
		}
		return classList.join(" ");
	});

	return (
		<button
			className={bind(classname)}
			tooltip_text={bind(tooltipText)}
			onClick={(_, event) => {
				if (event.button === Gdk.BUTTON_PRIMARY) {
					device.set_mute(!device.get_mute());
				}
			}}
			onScroll={(_, { delta_y }) => {
				if (delta_y < 0) {
					device.set_volume(device.volume + 0.05);
					device.set_mute(false);
				} else {
					device.set_volume(device.volume - 0.05);
					device.set_mute(false);
				}
			}}
		>
			<icon icon={bind(device, "volume_icon")} />
		</button>
	);
}

function DeviceSlider({ device }: any) {
	const { audio } = AstalWp.get_default() as { audio: any };
	const Speaker = audio.get_default_speaker();

	return (
		<slider
			className={`audio-mixer ${device}-slider Slider`}
			halign={CENTER}
			valign={CENTER}
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

function DeviceControlGroup({ devices }: { devices: any[] }) {
	return (
		<box className={"audio-mixer devices"} vertical={true} vexpand={true} spacing={10} valign={CENTER} halign={CENTER}>
			{devices.map((device) => (
				<box spacing={5} key={device.id}>
					<DeviceIdentifier device={device} />
					<DeviceSlider device={device} />
				</box>
			))}
		</box>
	);
}

function AppMixerItem({ stream }: { stream: any }) {
	const classname = Variable.derive([bind(stream, "mute")], (isMuted) => {
		const classList = ["audio-mixer", "item"];
		if (isMuted) {
			classList.push("muted");
		}
		return classList.join(" ");
	});
	const mixerLabel = (
		<button
			className={bind(classname)}
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
			<box spacing={5} vertical={false} valign={CENTER}>
				<icon valign={START} tooltip_text={bind(stream, "description").as((n) => n || "")} icon={bind(stream, "icon").as((n) => n || Icon.audio.type.speaker)} />
				<label valign={CENTER} xalign={0} ellipsize={Pango.EllipsizeMode.END} max_width_chars={28} label={bind(stream, "description").as((d) => d || "")} />
			</box>
		</button>
	);
	const streamSlider = (
		<slider
			className={"audio-mixer item Slider"}
			halign={CENTER}
			valign={CENTER}
			hexpand={true}
			draw_value={false}
			value={bind(stream, "volume")}
			onDragged={({ value }) => {
				stream.volume = value;
			}}
		/>
	);
	return (
		<box className={"audio-mixer item"} visible={true} hexpand={false} halign={CENTER} vertical={true} spacing={2}>
			{[mixerLabel, streamSlider]}
		</box>
	);
}

function SettingsButton() {
	return (
		<button
			className={"audio-mixer settings-button"}
			onClicked={() => {
				execAsync("pavucontrol");
				App.toggle_window("dashboard");
			}}
			hexpand={true}
			halign={END}
			valign={START}
		>
			<icon icon={Icon.ui.settings} />
		</button>
	);
}

export default function AudioMixer() {
	const { audio } = AstalWp.get_default() as { audio: any };
	const Speaker = audio.get_default_speaker();
	const Microphone = audio.get_default_microphone();

	const activeStreams = (
		<box vertical={true}>
			<label className={"audio-mixer header"} label={"Active Audio Streams"} visible={audio.get_streams.length > 0} />
			{bind(audio, "streams").as((streams) =>
				streams.length > 0 ? streams.map((stream: any, index: any) => <AppMixerItem key={index} stream={stream} />) : <label label="No Active Audio Streams" />,
			)}
		</box>
	);
	return (
		<box vertical={true} className={"audio-mixer container"} spacing={10} hexpand={false}>
			<label className={"header"} label={"Audio Devices & Streams"} halign={CENTER} />
			<DeviceControlGroup devices={[Speaker, Microphone]} />
			{activeStreams}
			<SettingsButton />
		</box>
	);
}
