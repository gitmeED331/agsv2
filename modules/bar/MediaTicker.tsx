import { Widget, App, Gtk, Gdk, Variable, Astal, bind } from "astal";
import Mpris from "gi://AstalMpris";
import Pango from "gi://Pango";

import TrimTrackTitle from "../lib/TrimTrackTitle";
import Icon, { Icons } from "../lib/icons";

const player = Mpris.Player.new("Deezer") //"Deezer"  "vlc" "mpv";

function TickerTrack() {
  return (
    <label
      className={"tickertrack"}
      vexpand={true}
      wrap={false}
      halign={Gtk.Align.CENTER}
      valign={Gtk.Align.CENTER}
      ellipsize={Pango.EllipsizeMode.END}
      label={bind(player, "title").as((title) => TrimTrackTitle(title))}
    />
  );
}

function TickerArtist() {

  return (
    <label
      className={"tickerartist"}
      wrap={false}
      halign={Gtk.Align.CENTER}
      valign={Gtk.Align.CENTER}
      ellipsize={Pango.EllipsizeMode.END}
      maxWidthChars={35}
      label={bind(player, "artist").as((artist) => artist || "Unknown Artist")}
    />
  );
}

function TickerIcon() {
  return (
    <icon
      className={"tickericon"}
      hexpand={true}
      halign={Gtk.Align.CENTER}
      valign={Gtk.Align.CENTER}
      tooltip_text={bind(player, "identity")}
      icon={bind(player, "entry").as(
        entry => Icons(entry) || Icon.mpris.controls.FALLBACK_ICON,
      )}
    />
  );
}

const NoMedia = (
  <label
    className={"nomedia"}
    hexpand={true}
    wrap={false}
    halign={Gtk.Align.CENTER}
    valign={Gtk.Align.CENTER}
    label={"No Media"}
  />
);
function TickerBox() {
  return (
    <box
      className={"tickerbox"}
      visible={true}
      vertical={false}
      hexpand={true}
      vexpand={false}
      valign={Gtk.Align.CENTER}
    >
      {bind(player, "playbackStatus").as((status) => {
        switch (status) {
          case Mpris.PlaybackStatus.STOPPED:
            return NoMedia;
          case Mpris.PlaybackStatus.PLAYING:
          case Mpris.PlaybackStatus.PAUSED:
            return (
              <box vertical={false} visible={true} spacing={5}>
                <TickerTrack />
                <TickerIcon />
                <TickerArtist />
              </box>
            );

          default:
            return NoMedia;
        }
      })}
    </box>
  );
}

function MediaTickerButton() {
  return (
    <button
      className={"tickerbtn"}
      vexpand={false}
      hexpand={true}
      onClick={(_, event) => {
        if (event.button === Gdk.BUTTON_PRIMARY) {
          const win = App.get_window("mediaplayerwindow");
          if (win) {
            win.visible = !win.visible;
          }
        }
        if (event.button === Gdk.BUTTON_SECONDARY) {
          player.play_pause();
        }

        // if (event.button === Gdk.BUTTON_MIDDLE) {
        // }

      }}
      onScroll={(_, { delta_y }) => {
        if (delta_y < 0) {
          player.previous();
        }
        else {
          player.next();
        }
      }}
    >
      <TickerBox />
    </button >
  );
}

export default MediaTickerButton;
