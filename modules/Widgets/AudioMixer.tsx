import { Gdk, Gtk, App, Widget } from "astal/gtk3";
import { bind, Binding, execAsync, Variable } from "astal";
import Icon, { Icons } from "../lib/icons";
import AstalWp from "gi://AstalWp";

const { audio } = AstalWp.get_default()!;

function AudioElement({ element, type, ...props }: { element: AstalWp.Endpoint; type: "device" | "stream" } & Widget.SliderProps) {
	const Bindings = Variable.derive(
		[
			bind(element, "volume"),
			bind(element, "mute"),
			bind(element, "icon"),
			bind(element, "volume_icon"),
			bind(element, "description"),
			bind(audio, "default_speaker"),
			bind(audio, "default_microphone"),
		],
		(volume, isMuted, aIcon, volumeIcon, description, speaker, microphone) => ({
			tooltip: {
				device: isMuted ? "Muted" : `${description} \n Volume ${(volume * 100).toFixed(2)}%`,
				stream: isMuted ? "Muted" : `${description} \n Volume ${(volume * 100).toFixed(2)}%`,
			}[type],
			buttonCN: {
				device: `audio-mixer volume-indicator ${isMuted || volume === 0 ? "muted" : ""}`,
				stream: `audio-mixer volume-indicator ${isMuted || volume === 0 ? "muted" : ""}`,
			}[type],
			sliderCN: {
				device: `audio-mixer Slider ${isMuted || volume === 0 ? "muted" : ""}`,
				stream: `audio-mixer Slider ${isMuted || volume === 0 ? "muted" : ""}`,
			}[type],
			theIcon: {
				device: isMuted || volume === 0 ? (element === microphone ? Icon.audio.mic.muted : Icon.audio.speaker.muted) : volumeIcon,
				stream: isMuted || volume === 0 ? Icon.audio.speaker.muted : aIcon,
			}[type],
			sliderValue: {
				device: volume,
				stream: volume,
			}[type],
			theDescription: {
				device: description || "Device",
				stream: description || "Stream",
			}[type],
		}),
	)();

	const handleClick = (_: any, event: any) => {
		if (event.button === Gdk.BUTTON_PRIMARY) {
			element.set_mute(!element.get_mute());
		}
	};

	const handleScroll = (_: any, { delta_y }: any) => {
		const volumeChange = delta_y < 0 ? 0.05 : -0.05;
		element.set_volume(element.volume + volumeChange);
		element.set_mute(false);
	};

	function theTooltip() {
		return (
			<box spacing={10}>
				<icon
					icon={bind(Bindings).as((c) => c.theIcon)}
					css={`
						font-size: 2rem;
					`}
				/>
				<label label={bind(Bindings).as((l) => l.tooltip)} />
			</box>
		);
	}

	return (
		<box vertical spacing={5} halign={CENTER} valign={CENTER}>
			<button
				className={bind(Bindings).as((c) => c.buttonCN)}
				onClick={handleClick}
				onScroll={handleScroll}
				halign={START}
				// tooltip_markup={bind(Bindings).as((t) => t.tooltip)}
				hasTooltip
				onQueryTooltip={(self, x, y, kbtt, tooltip) => {
					tooltip.set_custom(theTooltip());
					return true;
				}}
			>
				<box spacing={5} valign={FILL} halign={START}>
					<icon icon={bind(Bindings).as((i) => i.theIcon)} halign={START} />
					<label xalign={0} truncate max_width_chars={28} label={bind(Bindings).as((d) => d.theDescription)} halign={START} />
				</box>
			</button>
			<slider
				className={bind(Bindings).as((c) => c.sliderCN)}
				halign={START}
				valign={FILL}
				vexpand={true}
				drawValue={false}
				min={0}
				max={1.5}
				value={bind(Bindings).as((v) => v.sliderValue)}
				onDragged={({ value, dragging }: any) => {
					if (dragging) {
						element.set_volume(value);
						element.set_mute(value === 0);
					}
				}}
				{...props}
			/>
		</box>
	);
}

function SettingsButton() {
	return (
		<button
			className={"audio-mixer settings-button"}
			onClicked={() => {
				execAsync("pavucontrol");
				App.toggle_window(`dashboard${App.get_monitors()[0]}`);
			}}
			hexpand
			halign={END}
			valign={START}
		>
			<icon icon={Icon.ui.settings} />
		</button>
	);
}

export default function () {
	const Speaker = audio.get_default_speaker();
	const Microphone = audio.get_default_microphone();

	// const theDevices = <scrollable expand vscroll={Gtk.PolicyType.NEVER} hscroll={Gtk.PolicyType.AUTOMATIC} halign={FILL} valign={START}>
	// 	<box halign={START} >
	// 		<Device device={Speaker} setup={(self) => {
	// 			self.connect("scroll-event", (_: any, event: any) => {
	// 				theDevices.emit("scroll-event", event);
	// 				return true;
	// 			})
	// 		}} />
	// 		<Device device={Microphone} setup={(self) => {
	// 			self.connect("scroll-event", (_: any, event: any) => {
	// 				theDevices.emit("scroll-event", event);
	// 				return true;
	// 			})
	// 		}} />
	// 	</box>
	// </scrollable>

	// const theStreams = <scrollable expand vscroll={Gtk.PolicyType.NEVER} hscroll={Gtk.PolicyType.AUTOMATIC} halign={FILL} valign={START}>
	// 	{bind(audio, "streams").as((streams) => (streams.length > 0
	// 		? streams.map((stream: any) => <AppMixerItem stream={stream}
	// 			setup={(self) => {
	// 				self.connect("scroll-event", (_: any, event: any) => {
	// 					theStreams.emit("scroll-event", event);
	// 					return true;
	// 				})
	// 			}}
	// 		/>)
	// 		: <label label="No Active Audio Streams" />))}
	// </scrollable>

	return (
		<box vertical className={"audio-mixer container"} spacing={10} hexpand={false}>
			<box className={"audio-mixer devices"} vertical>
				<label className={"header"} label={"Audio Devices"} halign={CENTER} />

				<box vertical spacing={10}>
					{/* {bind(audio, "devices").as(ds =>
						ds.map((d: any) =>
							<AudioElement element={d} type={"device"} />
						)
					)} */}

					<AudioElement element={Speaker!} type={"device"} />
					<AudioElement element={Microphone!} type={"device"} />
				</box>
			</box>

			<box className={"audio-mixer streams"} vertical>
				<label className={"header"} label={bind(audio, "streams").as((streams) => (streams.length > 0 ? "Active Audio Streams" : "No Active Audio Streams"))} halign={CENTER} />
				<box vertical spacing={10}>
					{bind(audio, "streams").as((streams) => streams.map((stream: any) => <AudioElement element={stream} type={"stream"} />))}
				</box>
			</box>

			<SettingsButton />
		</box>
	);
}

// setup: (self) => {
// 	self.on("scroll-event", (widget, event) => {
// 		let [ok, delta_x, delta_y] = event.get_scroll_deltas()
// 		if (delta_y != 0) {
// 			delta_x = delta_y
// 			let adj = self.get_hadjustment()
// 			adj.value += delta_x
// 			self.set_hadjustment(adj)
// 			return true;
// 		}
// 	})
// },
