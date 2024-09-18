import { App, Astal, Gdk } from "astal";
import Mpris from "gi://AstalMpris";
import { Player } from "../Widgets/index";

const player = Mpris.Player.new("Deezer")

export default function MediaPlayerWindow() {
  return (
    <window
      name={"mediaplayerwindow"}
      className={"window media-player"}
      anchor={Astal.WindowAnchor.TOP | Astal.WindowAnchor.RIGHT}
      layer={Astal.Layer.OVERLAY}
      exclusivity={Astal.Exclusivity.NORMAL}
      keymode={Astal.Keymode.EXCLUSIVE}
      visible={false}
      application={App}
      margin-right={90}
    >
      <eventbox onKeyPressEvent={(_, event) => {
        if (event.get_keyval()[1] === Gdk.KEY_Escape) { App.toggle_window("mediaplayerwindow") }
      }}>
        <box className={"mediaplayerbox"}>
          <Player player={player} />
        </box>
      </eventbox>
    </window>
  );
}

//   {players.watch([], [
//                 [Mpris, "player-changed"],
//                 [Mpris, "player-added"],
//                 [Mpris, "player-closed"],
//             ], () => Mpris.players)
//                 .transform(p => p.filter(p => p.play_back_status !== 'Stopped').map(Player))
//             }
