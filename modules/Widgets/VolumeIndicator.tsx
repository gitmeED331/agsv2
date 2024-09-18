import { Widget, App, Gtk, Gdk, bind, Variable } from "astal";
import Wp from "gi://AstalWp";

const { audio } = Wp.get_default_wp()

const Speaker = audio.get_default_speaker()

function VolumeIndicator() {
  const volumeIndicatorClassName = () => {
    const classes = ["volume-indicator"];
    if (Speaker?.get_mute() === true) {
      classes.push("muted");
    }
    const className = classes.join(" ");
    return className;
  };

  const tooltip = Variable.derive(
    [bind(Speaker, "volume"), bind(Speaker, "mute")],
    (v, m) => m ? "Muted" : `Volume ${(v * 100).toFixed(2)}%`,
  )

  return (
    <button
      tooltip_text={bind(tooltip)}
      className={volumeIndicatorClassName()}
      onClick={(_, event) => {
        if (event.button === Gdk.BUTTON_PRIMARY) {
          const win = App.get_window("audiomixerwindow");
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
