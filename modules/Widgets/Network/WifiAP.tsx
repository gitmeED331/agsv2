import { Gtk, Gdk, Widget } from "astal/gtk3";
import { execAsync, bind, Variable } from "astal";
import AstalNetwork from "gi://AstalNetwork";
import NM from "gi://NM";
import Spinner from "../../Astalified/Spinner";

export default function WifiAP({ ap, wifi }: { ap: any, wifi: AstalNetwork.Wifi }) {
    const isActiveAP = wifi.active_access_point && wifi.active_access_point.ssid === ap.ssid ? true : false;
    const isConnecting = NM.State.CONNECTING === ap.state ? true : false;
    const passreveal = Variable(false);
    // @ts-ignore
    const noPw = NM["80211ApSecurityFlags"].NONE;
    // @ts-ignore
    const apPrivacy = NM["80211ApFlags"].NONE;
    const SecuredAP = !apPrivacy && !noPw;

    const checkStoredPassword = async (ssid: string): Promise<boolean> => {
        try {
            const result = await execAsync(`nmcli -s -g 802-11-wireless-security.psk connection show "${ap.ssid}"`);
            return result.trim() !== "";
        } catch (error) {
            return false;
        }
    };

    const PasswordEntry = (
        <revealer halign={FILL} valign={FILL} transitionType={Gtk.RevealerTransitionType.SLIDE_DOWN} transitionDuration={300} revealChild={bind(passreveal)} visible={bind(passreveal)}>
            <entry
                placeholder_text={"Enter Password"}
                visibility={false}
                visible={true}
                halign={FILL}
                valign={FILL}
                css={`
					min-width: 10px;
					min-height: 10px;
				`}
                onActivate={(self) => {
                    const password = self.get_text();
                    if (password) {
                        execAsync(`nmcli dev wifi connect ${ap.ssid} password ${password}`).then(
                            () => {
                                execAsync(`notify-send "WiFi" "Successfully connected to Secured ${ap.ssid}"`);
                            },
                            (error) => {
                                execAsync(`notify-send -u critical "WiFi Error" "Failed to connect to ${ap.ssid}"`);
                            },
                        );
                    }
                }}
            />
        </revealer>
    );

    const CustomButton = ({ action, ...props }: { action: "connect" | "disconnect" | "forget" } & Widget.ButtonProps) => {
        const sap = SecuredAP ? "Secured: Password Required" : "Unsecured";
        const notify = async (title: string, message: string, urgency: string = "normal") => {
            await execAsync(`notify-send -u ${urgency} "${title}" "${message}"`);
        };

        const handleError = async (action: string, error: any) => {
            await notify("WiFi Error", `Failed to ${action} ${ap.ssid}: ${error}`, "critical");
            console.error(`Failed to ${action} ${ap.ssid}: ${error}`);
        };

        const label = (ssid: string, freq: number, rate: number) => {
            // Added arrow function syntax
            const frequencyGHz = (freq / 1000).toFixed(1) + "GHz";
            const maxBitrateMbps = (rate / 1000).toFixed(0) + "Mbps";
            return [ssid, frequencyGHz, maxBitrateMbps].join(" - ");
        };

        const bindings = Variable.derive([bind(ap, "ssid"), bind(ap, "frequency"), bind(ap, "maxBitrate")], (ssid, freq, rate) => ({
            command: {
                connect: async () => {
                    if (!isActiveAP) {
                        if (SecuredAP) {
                            const hasStoredPassword = await checkStoredPassword(ssid);
                            if (hasStoredPassword) {
                                try {
                                    await execAsync(`nmcli con up "${ssid}"`);
                                    await notify("WiFi", `Connected to ${ssid}`);
                                } catch (error) {
                                    await handleError("connect to", error);
                                }
                            } else {
                                passreveal.set(!passreveal.get());
                                PasswordEntry.grab_focus();
                            }
                        } else {
                            await execAsync(`nmcli con up "${ssid}"`);
                        }
                    }
                },
                disconnect: async () => {
                    try {
                        await execAsync(`nmcli con down "${ssid}"`);
                        await notify("WiFi", `Disconnected from ${ssid}`);
                    } catch (error) {
                        await handleError("disconnect", error);
                    }
                },
                forget: async () => {
                    try {
                        await execAsync(`nmcli connection delete "${ssid}"`);
                        await notify("WiFi", `Forgot ${ssid}`);
                    } catch (error) {
                        await handleError("forget", error);
                    }
                },
            }[action],

            halign: {
                connect: START,
                disconnect: END,
                forget: END,
            }[action],

            visible: {
                connect: true,
                disconnect: isActiveAP,
                forget: isActiveAP,
            }[action],

            tooltip: {
                connect: isActiveAP ? "Connected: Secured" : sap,
                disconnect: "Disconnect",
                forget: "Forget/ Delete AP",
            }[action],

            className: {
                connect: "connect",
                disconnect: "disconnect",
                forget: "forget",
            }[action],

            content: {
                connect: [<icon icon={ap.icon_name} valign={CENTER} halign={START} />, <label label={label(ssid, freq, rate)} valign={CENTER} halign={START} />],
                disconnect: <icon icon={"circle-x-symbolic"} />,
                forget: <icon icon={"edit-delete-symbolic"} />,
            }[action],
        }))();

        return (
            <button
                className={`wifi ap ${bindings.as((c) => c.className)}`}
                onClick={(_, event) => {
                    if (event.button === Gdk.BUTTON_PRIMARY) {
                        bindings.get().command();
                    }
                }}
                tooltip_text={bindings.as((b) => b.tooltip)}
                halign={bindings.as((c) => c.halign)}
                valign={CENTER}
                cursor={"pointer"}
                visible={bindings.as((b) => b.visible)}
                height_request={10}
                {...props}
            >
                <box vertical={false} spacing={5} halign={FILL} valign={CENTER}>
                    {bindings.get().content}
                </box>
            </button>
        );
    };

    return (
        <box vertical={true}>
            <centerbox
                height_request={20}
                className={`wifi ap ${isActiveAP ? "connected" : ""}`}
                halign={FILL}
                valign={FILL}
                startWidget={<CustomButton action={"connect"} />}
                endWidget={
                    <stack className={"wifi connected controls"} visible={isActiveAP || isConnecting} halign={END} visible_child_name={isConnecting ? "connectionSpinner" : "controls"} homogeneous={false}>
                        <box name={"connectionSpinner"} halign={END}>
                            <Spinner name={"connectionSpinner"} setup={(self) => (isConnecting ? self.start() : self.stop())} halign={CENTER} valign={CENTER} />
                            <label label={"Connecting..."} halign={END} valign={CENTER} />
                        </box>
                        <box name={"controls"} halign={END} spacing={5}>
                            <CustomButton action={"disconnect"} />
                            <CustomButton action={"forget"} />
                        </box>
                    </stack>
                }
            />
            {PasswordEntry}
        </box>
    );
}