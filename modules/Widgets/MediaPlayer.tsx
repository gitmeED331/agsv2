import { Widget, bind, execAsync, Gtk, Astal, GLib } from "astal";
import Mpris from "gi://AstalMpris";
import Pango from "gi://Pango";

import Icon, { Icons } from "../lib/icons";
import TrimTrackTitle from "../lib/TrimTrackTitle";

const player = Mpris.Player.new("Deezer") //"Deezer"  "vlc" "mpv" "spotify"

function TrackInfo() {

  const title = (
    <label
      className={"tracktitle"}
      wrap={false}
      hexpand={true}
      halign={Gtk.Align.CENTER}
      ellipsize={Pango.EllipsizeMode.END}
      maxWidthChars={35}
      label={bind(player, "title").as((title) => TrimTrackTitle(title))}
    />
  );

  const artist = (
    <label
      className={"artist"}
      wrap={false}
      hexpand={true}
      halign={Gtk.Align.CENTER}
      ellipsize={Pango.EllipsizeMode.END}
      maxWidthChars={30}
      label={bind(player, "artist").as((artist) => artist || "Unknown Artist")}
    />
  );
  return (
    <box
      className={"trackinfo"}
      valign={Gtk.Align.CENTER}
      halign={Gtk.Align.CENTER}
      hexpand={true}
      vertical={true}
      spacing={5}
    >
      {title}
      {artist}
    </box>
  );
}

/** @param {number} length */
function lengthStr(length: number) {
  const min = Math.floor(length / 60);
  const sec = Math.floor(length % 60);
  const sec0 = sec < 10 ? "0" : "";
  return `${min}:${sec0}${sec}`;
}

function TrackPosition() {
  const positionSlider = (
    <slider
      hexpand={false}
      className="position"
      drawValue={false}
      onDragged={({ value }) => {
        if (player.length > 0) {
          const newPosition = (value / player.length) * player.length;
          player.set_position(newPosition);
        }
      }}
      max={bind(player, "length")}
      min={0}
      value={bind(player, "position")}
    />
  )

  const lengthLabel = (
    <label
      className={"tracklength"}
      halign={Gtk.Align.START}
      label={bind(player, "length").as(lengthStr)}
    />
  )

  const positionLabel = (
    <label
      className={"trackposition"}
      halign={Gtk.Align.END}
      label={bind(player, "position").as(lengthStr)}
    />
  )

  return (
    <box
      className={"positioncontainer"}
      vertical={true}
      visible={bind(player, "length").as(length => length > 0 ? true : false)}
    >
      {positionSlider}
      <centerbox
        startWidget={lengthLabel}
        endWidget={positionLabel}
      />
    </box >
  );
}

function PlayerIcon() {
  return (
    <button
      className={"playicon"}
      onClick={async () => {
        await execAsync(`bash -c 'hyprctl dispatch exec "${bind(player, "entry")}"'`);
      }}
    >
      <icon
        hexpand={true}
        halign={Gtk.Align.END}
        valign={Gtk.Align.CENTER}
        tooltip_text={bind(player, "identity")}
        icon={bind(player, "entry").as(
          (entry) => Icons(entry) || Icon.mpris.controls.FALLBACK_ICON,
        )}
      />
    </button >
  );
}

function PlayerControls() {
  const playPause = (
    <button
      className={"play-pause"}
      valign={Gtk.Align.CENTER}
      onClick={() => player.play_pause()}
      visible={bind(player, "can_play")}
    >
      <icon
        icon={bind(player, "playbackStatus").as((s) =>
          s === Mpris.PlaybackStatus.PLAYING
            ? Icon.mpris.controls.PAUSE
            : Icon.mpris.controls.PLAY,
        )}
      />
    </button>
  );

  const prev = (
    <button
      className={"previous"}
      valign={Gtk.Align.CENTER}
      onClick={() => player.previous()}
      visible={bind(player, "can_go_previous")}
    >
      <icon icon={Icon.mpris.controls.PREV} />
    </button>
  );

  const next = (
    <button
      className={"next"}
      valign={Gtk.Align.CENTER}
      onClick={() => player.next()}
      visible={bind(player, "can_go_next")}
    >
      <icon icon={Icon.mpris.controls.NEXT} />
    </button>
  );
  return (
    <box
      className={"playercontrols"}
      vexpand={false}
      hexpand={false}
      halign={Gtk.Align.CENTER}
      valign={Gtk.Align.CENTER}
    >
      {prev} {playPause} {next}
    </box>
  );
}

function CloseIcon() {
  return (
    <button className={"close"} valign={Gtk.Align.CENTER}
      onClick={async () => {
        await execAsync(`bash -c 'killall "${bind(player, "entry")}"'`);
      }}
    >
      <icon icon={Icon.mpris.controls.CLOSE} />
    </button>
  );
}

/**
 * @param {string} cover_art - Cover image path.
 */
const blurCoverArtCss = async (cover_art: string): Promise<string> => {
  /**
   * Generate CSS background style for music player.
   * @param {string} bg - Background image path.
   * @param {string} color - Dominant color extracted from the image.
   * @returns {string} CSS background style.
   */
  const playerBGgen = (bg: string, color: string): string =>
    `background-image: radial-gradient(circle at left, rgba(0, 0, 0, 0), ${color} 11.5rem), url('${bg}');
         background-position: left top, left top;
         background-size: contain;
         transition: all 0.7s ease;
         background-repeat: no-repeat;`;

  if (cover_art) {
    const color = await execAsync(
      `bash -c "convert ${cover_art} -alpha off -crop 5%x100%0+0+0 -colors 1 -unique-colors txt: | head -n2 | tail -n1 | cut -f4 -d' '"`,
    );
    return playerBGgen(cover_art, color);
  }
  return "background-color: #0e0e1e";
};

/** @param {import('types/service/mpris').MprisPlayer} player */
function Player({ player }: { player: Mpris.Player }) {
  async function setup(box: Widget.Box) {
    box.css = await blurCoverArtCss(player.cover_art);
    box.hook(player, "notify::cover-art", async () => {
      box.css = await blurCoverArtCss(player.cover_art);
    });
  }

  return (
    <box
      className={"player"}
      vertical={false}
      hexpand={true}
      spacing={5}
      halign={Gtk.Align.END}
      valign={Gtk.Align.CENTER}
      visible={bind(player, "available").as(a => a === true)}
      setup={setup}
    >
      <centerbox className={"mediainfo"} vertical={true} vexpand={true}
        startWidget={<box vertical={false} valign={Gtk.Align.CENTER}>
          <TrackInfo player={player} />
          <PlayerIcon />
        </box>}
        centerWidget={<TrackPosition />}
        endWidget={<PlayerControls />}
      />
      <CloseIcon />
    </box>
  );
}

export default Player;
