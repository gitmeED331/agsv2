import { Gtk, Gdk, App, Widget } from "astal/gtk3";
import { bind, Variable, execAsync } from "astal";
import AstalWp from "gi://AstalWp"

const { audio, video } = AstalWp.get_default()!;

function PrivacyTooltip(eps: AstalWp.Endpoint[]) {
    return (
        <box vertical>
            {eps.map(ep => {
                return (
                    <box>
                        <icon icon={ep.icon} />
                        <label label={ep.name} />
                    </box>
                );
            })}
        </box>
    );
}

function PrivacyIndicator({ obj, type }: { obj: AstalWp.Audio | AstalWp.Video, type: "recorders" | "streams" }) {
    return (
        <icon
            visible={bind(obj, type).as(list => list.length > 0)}
            icon={type == "recorders" ? "audio-input-microphone-symbolic" : "audio-speakers-symbolic"}
            has_tooltip={true}
            onQueryTooltip={(self, x, y, kbtt, tooltip) => {
                tooltip.set_custom(PrivacyTooltip(obj[type]));
                return true;
            }}
        />
    );
}

export default function PrivacyModule() {
    return (
        <box visible={bind(audio, "recorders").as(list => list.length > 0) || bind(video, "recorders").as(list => list.length > 0)} >
            <PrivacyIndicator obj={audio} type="recorders" />
            <PrivacyIndicator obj={audio} type="streams" />
            <PrivacyIndicator obj={video} type="recorders" />
            <PrivacyIndicator obj={video} type="streams" />
        </box>
    );
}