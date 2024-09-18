import { Astal, Widget, bind, Gtk, Gdk, App, execAsync, Variable } from "astal";
import Icon, { Icons } from "../../lib/icons";
import AstalBluetooth from "gi://AstalBluetooth";
import Pango from "gi://Pango";

const Bluetooth = AstalBluetooth.get_default();
const Adapter = Bluetooth.adapter

const btControls = () => {
    const btPower = (
        <button
            className={bind(Bluetooth, "is_powered").as((v) => v ? "bluetooth power-on" : "bluetooth power-off")}
            onClick={(_, event) => {
                if (event.button === Gdk.BUTTON_PRIMARY) {
                    execAsync(`bluetoothctl power ${Bluetooth.is_powered ? "off" : "on"}`);
                }
            }}
            halign={Gtk.Align.END} valign={Gtk.Align.CENTER}
            tooltip_text={bind(Bluetooth, "is_powered").as((v) => v ? "Power off" : "Power on")}
        >
            <icon
                icon={bind(Bluetooth, "is_powered").as((v) => v ? Icon.bluetooth.enabled : Icon.bluetooth.disabled)}
                halign={Gtk.Align.END} valign={Gtk.Align.CENTER}
            />
        </button>
    );

    const Refresh = (
        <button
            className={bind(Adapter, "discovering").as((v) => v ? "bluetooth refreshing" : "bluetooth stale")}
            onClick={async (_, event) => {
                if (event.button === Gdk.BUTTON_PRIMARY) {
                    //await execAsync("bluetoothctl --timeout 120 scan on").catch(console.error);
                    await Adapter.start_discovery()
                    setTimeout(() => { Adapter.stop_discovery() }, 120000)
                }
                if (event.button === Gdk.BUTTON_SECONDARY) {
                    Adapter.stop_discovery()
                }
            }}
            halign={Gtk.Align.CENTER} valign={Gtk.Align.CENTER}
            tooltip_text={"Refresh"}
        >
            <icon
                icon={"view-refresh-symbolic"}
                halign={Gtk.Align.CENTER} valign={Gtk.Align.CENTER}
            />
        </button>
    );

    return (
        <box
            className={"bluetooth devicelist-header controls"}
            halign={Gtk.Align.CENTER}
            valign={Gtk.Align.CENTER}
            spacing={5}
        >
            {btPower}
            {Refresh}
        </box>
    );
};

function content(device) {
    const DeviceButton = () => {
        const btDeviceLabel = (
            <label
                label={device.name}
                halign={Gtk.Align.START} valign={Gtk.Align.CENTER}
                ellipsize={Pango.EllipsizeMode.END}
                tooltip_text={device.address || "No Address"}
            />
        );

        const DeviceTypeIcon = (
            <icon
                icon={device.icon || "bluetooth-symbolic"}
                halign={Gtk.Align.START} valign={Gtk.Align.CENTER}
            />
        );

        return (
            <button
                halign={Gtk.Align.FILL}
                valign={Gtk.Align.CENTER}
                onClick={() => {
                    execAsync(`bluetoothctl ${device.connected ? "disconnect" : "connect"} ${device.address}`);
                }}
            >
                <centerbox
                    halign={Gtk.Align.START}
                    valign={Gtk.Align.CENTER}
                    spacing={5}
                    startWidget={DeviceTypeIcon}
                    centerWidget={btDeviceLabel}
                />
            </button>
        );
    };

    const btDeviceControls = () => {
        const PairDevice = (
            <button
                className={"bluetooth devicelist-inner controls pair"}
                onClick={(_, event) => {
                    if (event.button === Gdk.BUTTON_PRIMARY) {
                        execAsync(`bluetoothctl ${device.paired ? "Unpair" : "Pair"} ${device.address}`);
                    } else if (event.button === Gdk.BUTTON_SECONDARY) {
                        execAsync(`bluetoothctl cancel-pairing ${device.address}`);
                    }
                }}
                halign={Gtk.Align.END} valign={Gtk.Align.CENTER}
                tooltip_text={bind(device, "paired").as((v) => v ? "Unpair" : "Pair")}
            >
                <icon
                    icon={bind(device, "paired").as((v) => v ? Icons("bluetooth-link-symbolic") : Icons("bluetooth-unlink-symbolic"))}
                    halign={Gtk.Align.END} valign={Gtk.Align.CENTER}
                />
            </button>
        );
        const TrustDevice = (
            <button
                className={"bluetooth devicelist-inner controls trust"}
                onClick={(_, event) => {
                    if (event.button === Gdk.BUTTON_PRIMARY) {
                        execAsync(`bluetoothctl ${device.trusted ? "untrust" : "trust"} ${device.address}`);
                    }
                }}
                halign={Gtk.Align.END} valign={Gtk.Align.CENTER}
                tooltip_text={bind(device, "trusted").as((v) => v ? "Untrust" : "Trust")}
            >
                <icon
                    icon={bind(device, "trusted").as((v) => v ? Icons("bluetooth-trust-symbolic") : Icons("bluetooth-untrust-symbolic"))}
                    halign={Gtk.Align.END} valign={Gtk.Align.CENTER}
                />
            </button>
        );
        const ConnectDevice = (
            <button
                className={"bluetooth devicelist-inner controls connect"}
                onClick={(_, event) => {
                    if (event.button === Gdk.BUTTON_PRIMARY) {
                        execAsync(`bluetoothctl ${device.connected ? "disconnect" : "connect"} ${device.address}`);
                    }
                }}
                halign={Gtk.Align.END} valign={Gtk.Align.CENTER}
                tooltip_text={bind(device, "connected").as((v) => v ? "Disconnect" : "Connect")}
            >
                <icon
                    icon={bind(device, "connected").as((v) => v ? Icons("bluetooth-connect-symbolic") : Icons("bluetooth-disconnect-symbolic"))}
                    halign={Gtk.Align.END} valign={Gtk.Align.CENTER}
                />
            </button>
        );
        const ForgetDevice = (
            <button
                className={"bluetooth devicelist-inner controls forget"}
                onClick={(_, event) => {
                    if (event.button === Gdk.BUTTON_PRIMARY) {
                        execAsync(`bluetoothctl remove ${device.address}`);
                    }
                }}
                visible={device.paired}
                halign={Gtk.Align.END} valign={Gtk.Align.CENTER}
                tooltip_text={"Forget"}
            >
                <icon
                    tooltip_text={"Forget"}
                    icon={Icons("circle-x-symbolic")}
                    halign={Gtk.Align.END} valign={Gtk.Align.CENTER}
                />
            </button>
        );

        return (
            <box
                className={"bluetooth devicelist-inner controls"}
                halign={Gtk.Align.END}
                valign={Gtk.Align.FILL}
                spacing={5}
            >
                {PairDevice}
                {TrustDevice}
                {ConnectDevice}
                {ForgetDevice}
            </box>
        );
    };

    return (
        <box
            className={`bluetooth devicelist-inner items ${device.connected ? "connected" : ""}`}
            halign={Gtk.Align.FILL}
            valign={Gtk.Align.FILL}
            visible={true}
            vertical={true}
        >
            <centerbox
                vertical={false}
                halign={Gtk.Align.FILL}
                valign={Gtk.Align.CENTER}
                startWidget={DeviceButton()}
                endWidget={btDeviceControls()}
            />
        </box>
    );
}

function BluetoothDevices() {
    const btdevicelist = bind(Bluetooth, "devices").as((devices) => {
        const availableDevices = devices
            .filter((btDev) => {
                const name = btDev.name ? btDev.name.trim() : null;
                return name && name !== "Unknown Device" && name !== "";
            })
            .sort((a, b) => {
                if (a.connected && !b.connected) return -1;
                if (!a.connected && b.connected) return 1;
                if (a.paired && !b.paired) return -1;
                if (!a.paired && b.paired) return 1;
                return a.name.localeCompare(b.name);
            });

        return availableDevices.map(device => content(device));
    });

    return (
        <box
            className={"bluetooth container"}
            name={"bluetooth"}
            halign={Gtk.Align.FILL}
            valign={Gtk.Align.FILL}
            visible={true}
            vertical={true}
            spacing={10}
        >
            <centerbox
                className={"bluetooth devicelist-header"}
                vertical={false}
                halign={Gtk.Align.FILL}
                valign={Gtk.Align.CENTER}
                centerWidget={<label label={"Bluetooth"} />}
                endWidget={btControls()}
            />
            <scrollable
                halign={Gtk.Align.FILL}
                valign={Gtk.Align.FILL}
                visible={true}
                vscroll={Gtk.PolicyType.AUTOMATIC}
                hscroll={Gtk.PolicyType.NEVER}
                vexpand={true}
                css={`min-height: 200px;`}
            >
                <box
                    className={"bluetooth devicelist-inner"}
                    halign={Gtk.Align.FILL}
                    valign={Gtk.Align.FILL}
                    visible={true}
                    vertical={true}
                    spacing={5}
                >
                    {btdevicelist}
                </box>
            </scrollable>
        </box>
    );
}

export default BluetoothDevices;
