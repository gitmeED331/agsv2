import { Gdk, Gtk, App, Astal } from "astal/gtk3";
import { bind, Variable, execAsync } from "astal";
import AstalWp from "gi://AstalWp";
import Icon, { Icons } from "../lib/icons";
import { dashboardLeftStack } from "../Windows/dashboard/LeftSide";

const TRANSITION = 300;
const REVEALMIC = Variable(true);
const { audio } = AstalWp.get_default()!;

function Indicator({ device, type }: { device: AstalWp.Endpoint; type: "speaker" | "mic" }) {
	const Bindings = Variable.derive(
		[bind(device, "volume"), bind(device, "mute"), bind(device, "icon"), bind(device, "volume_icon"), bind(device, "description"), bind(audio, "default_speaker"), bind(audio, "default_microphone")],
		(volume, isMuted, aIcon, volumeIcon, description, speaker, microphone) => ({
			tooltip: {
				speaker: isMuted ? "Muted" : `${description} \n Volume ${(volume * 100).toFixed(2)}%`,
				mic: isMuted ? "Muted" : `${description} \n Volume ${(volume * 100).toFixed(2)}%`,
			}[type],
			buttonCN: {
				speaker: `audio-mixer volume-indicator ${isMuted || volume === 0 ? "muted" : ""}`,
				mic: `audio-mixer volume-indicator ${isMuted || volume === 0 ? "muted" : ""}`,
			}[type],
			sliderCN: {
				speaker: `audio-mixer Slider ${isMuted || volume === 0 ? "muted" : ""}`,
				mic: `audio-mixer Slider ${isMuted || volume === 0 ? "muted" : ""}`,
			}[type],
			theIcon: {
				speaker: isMuted || volume === 0 ? Icon.audio.speaker.muted : volumeIcon,
				mic: isMuted || volume === 0 ? Icon.audio.mic.muted : volumeIcon,
			}[type],
			sliderValue: {
				speaker: volume,
				mic: volume,
			}[type],
			theDescription: {
				speaker: description || "Device",
				mic: description || "Stream",
			}[type],
		}),
	)();

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
		<button
			className={bind(Bindings).as((c) => c.buttonCN)}
			hasTooltip
			// tooltip_text={bind(Bindings).as((c) => c.tooltip)}
			onQueryTooltip={(self, x, y, kbtt, tooltip) => {
				tooltip.set_custom(theTooltip());
				return true;
			}}
			onClick={(_, event) => {
				if (event.button === Gdk.BUTTON_PRIMARY) {
					const dashTab = "settings";
					const win = App.get_window(`dashboard${App.get_monitors()[0].get_model()}`);
					const dashboardTab = dashboardLeftStack.get_visible_child_name() === dashTab;
					const setDashboardTab = dashboardLeftStack.set_visible_child_name(dashTab);
					if (win && win.visible) {
						if (!dashboardTab) {
							setDashboardTab;
						} else {
							App.toggle_window(`dashboard${App.get_monitors()[0].get_model()}`);
						}
					} else {
						App.toggle_window(`dashboard${App.get_monitors()[0].get_model()}`);
					}
				}
				if (event.button === Gdk.BUTTON_SECONDARY) {
					device?.set_mute(!device.get_mute());
				}
			}}
			onScroll={(_, { delta_y }) => {
				const volumeChange = delta_y < 0 ? 0.05 : -0.05;
				device?.set_volume(device.volume + volumeChange);
				device?.set_mute(false);
			}}
		>
			<icon icon={bind(Bindings).as((c) => c.theIcon)} />
		</button>
	);
}

export default function () {
	const Speaker = audio.get_default_speaker();
	const Microphone = audio.get_default_microphone();

	return (
		<box spacing={5} halign={CENTER} valign={CENTER}>
			<Indicator device={Speaker!} type={"speaker"} />
			{/* <revealer transitionType={Gtk.RevealerTransitionType.SLIDE_RIGHT}				transitionDuration={TRANSITION} clickThrough={true} revealChild={bind(REVEALMIC)}> */}
			<Indicator device={Microphone!} type={"mic"} />
			{/* </revealer> */}
		</box>
	);
}
