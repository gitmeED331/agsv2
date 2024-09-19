import { Widget, App, Gtk, Gdk, bind, Variable } from "astal";
import AstalWp from "gi://AstalWp";

const { audio } = AstalWp.get_default()

const Speaker = audio.get_default_speaker()

function VolumeIndicator() {
  const volumeIndicatorClassName = Variable.derive([bind(Speaker, "mute")], (isMuted) => {
    const classes = ["volume-indicator"];
    if (isMuted) {
      classes.push("muted");
    }
    const className = classes.join(" ");
    return className;
  })

  const tooltip = Variable.derive(
    [bind(Speaker, "volume"), bind(Speaker, "mute")],
    (v, m) => m ? "Muted" : `Volume ${(v * 100).toFixed(2)}%`,
  )

  return (
    <button
      tooltip_text={bind(tooltip)}
      className={bind(volumeIndicatorClassName)}
      onClick={(_, event) => {
        if (event.button === Gdk.BUTTON_PRIMARY) {
          const win = App.get_window("dashboard");
          if (win) {
            win.visible = !win.visible;
          }
        }
        if (event.button === Gdk.BUTTON_SECONDARY) {
          Speaker?.set_mute(!Speaker.get_mute());
        }
      }}
      onScroll={(_, { delta_y }) => {
        if (delta_y < 0) {
          Speaker?.set_volume(Speaker.volume + 0.05);
        }
        else {
          Speaker?.set_volume(Speaker.volume - 0.05);
        }
      }}
    >
      <icon icon={bind(Speaker, "volume_icon")} />
    </button>
  );
}
export default VolumeIndicator;
