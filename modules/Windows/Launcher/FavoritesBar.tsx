import { Gtk, App } from "astal/gtk3";
import { execAsync } from "astal";
import { Icons } from "../../lib/icons";

export default function FavoritesBar({ favorites }: any) {
    return (
        <box
            orientation={Gtk.Orientation.HORIZONTAL}
            spacing={10}
            halign={CENTER}
            valign={CENTER}
            className={"favorites-bar"}
            visible={true}
            hexpand={true}
        >
            {
                favorites.map((app) => (
                    <button
                        className="launcher favorite-app"
                        name={app.get_name()}
                        valign={CENTER}
                        halign={CENTER}
                        tooltip_text={app.get_description()}

                        on_clicked={() => {
                            app.launch();
                            execAsync('ags request launcher')
                        }}
                    >
                        <icon icon={Icons(app.icon_name)} />
                        {/* <label label={app.get_name()} truncate /> */}
                    </button>
                ))
            }
        </ box>
    );
}
