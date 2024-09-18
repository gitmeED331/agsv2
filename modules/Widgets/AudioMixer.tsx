import { bind, execAsync, Gtk, Astal, GLib, Variable, Gdk, App } from "astal";
import Icon, { Icons } from "../lib/icons";
import AstalWp from "gi://AstalWp";
import Pango from "gi://Pango";

const { audio } = AstalWp.get_default_wp();
const Speaker = audio.get_default_speaker();
const Microphone = audio.get_default_microphone();

function VolumeIdentifier({ device }) {
    const tooltipText = Variable.derive(
        [bind(device, "volume"), bind(device, "mute")],
        (volume, isMuted) => isMuted ? "Muted" : `Volume ${(volume * 100).toFixed(2)}%`
    );

    return (
        <button
            tooltip_text={bind(tooltipText)}
            className={`audio mixer volume-indicator ${device?.get_mute() ? "muted" : ""}`}
            onClick={(_, event) => {
                if (event.button === Gdk.BUTTON_PRIMARY) {
                    device?.set_mute(!device?.get_mute());
                }
            }}
        >
            <icon icon={bind(device, "volume_icon")} />
        </button>
    );
}

function VolumeSlider({ device }) {
    return (
        <slider
            className={`audio-mixer ${device}-slider Slider`}
            hexpand={true}
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

function VolumeControlGroup({ devices }) {
    return (
        <box
            className="audio-mixer speaker-mic"
            vertical={true}
            vexpand={true}
            spacing={10}
        >
            {devices.map((device) => (
                <box spacing={5} >
                    <VolumeIdentifier device={device} />
                    <VolumeSlider device={device} />
                </box>
            ))}
        </box>
    );
}

function AppMixerItem({ stream }) {
    const mixerLabel = () => (
        <box
            className={stream?.is_muted ? "muted" : ""}
            spacing={5}
            vertical={false}
            valign={Gtk.Align.CENTER}
        >
            <icon
                className={"mixeritemicon"}
                valign={Gtk.Align.START}
                tooltip_text={bind(stream, "description").as((n) => n || "")}
                icon={bind(stream, "icon_name")}
            />
            <label
                className={"mixeritemlabel"}
                valign={Gtk.Align.CENTER}
                xalign={0}
                ellipsize={Pango.EllipsizeMode.END}
                max_width_chars={28}
                label={bind(stream, "name").as((d) => d || "")}
            />
        </box>
    );

    return (
        <box
            className={"mixeritem"}
            hexpand={true}
            valign={Gtk.Align.CENTER}
            vertical={true}
            visible={true}
            spacing={10}
        >
            {mixerLabel()}
            <slider
                className={"mixeritemslider Slider"}
                hexpand={true}
                draw_value={false}
                value={bind(stream, "volume")}
                onDragged={({ value }) => {
                    stream.volume = value;
                }}
            />
        </box>
    );
}

function SettingsButton() {
    return (
        <button
            className={"audio-mixer settings-button"}
            onClick={() => {
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
function getActiveStreams() {
    try {
        return audio.get_streams();
    } catch (error) {
        console.error("Error fetching active streams:", error);
        return [];
    }
}

export default function AudioMixer() {
    const activeStreams = getActiveStreams();
    return (
        <box vertical={true} className={"audio-mixer container"} spacing={10}>
            <VolumeControlGroup devices={[Speaker, Microphone]} />
            <box vertical={true}>
                <label className={"audio-mixer header"} label="Active Audio Streams" visible={activeStreams.length > 0 ? true : false} />
                {activeStreams.length > 0 ? (
                    activeStreams.map((stream) => <AppMixerItem stream={stream} />)
                ) : (
                    <label label="No active audio streams" />
                )}
            </box>
            <SettingsButton />
        </box>
    );
}