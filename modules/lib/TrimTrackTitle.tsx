import { Astal } from "astal/gtk3";
import { bind } from "astal";
import Mpris from "gi://AstalMpris";

//const { RoundedCorner } = Roundedges
const mpris = Mpris.get_default();
const player = Mpris.Player.new("Deezer");

function TrimTrackTitle(title: string) {
  if (!title) return "";
  const cleanPatterns = [
    /【[^】]*】/, // Touhou n weeb stuff
    " [FREE DOWNLOAD]", // F-777
    " (Radio Version)",
    " (Album Version)",
    " (Cafe Session)",
    " (International Version)",
    " (Remastered)",
  ];
  cleanPatterns.forEach((expr) => (title = title.replace(expr, "")));
  return title;
}
export default TrimTrackTitle;
