import { Gtk, Gdk } from "astal/gtk3";
import { execAsync, bind, Variable } from "astal";
import Icon from "../../lib/icons";
import AstalNetwork from "gi://AstalNetwork";
import Pango from "gi://Pango";
import NM from "gi://NM";
import Spinner from "../../Astalified/Spinner";

function Header(wifi: AstalNetwork.Wifi) {

	const theSpinner = <Spinner name={"refreshspinner"} halign={CENTER} valign={CENTER}
		setup={(spinner) => {
			bind(wifi, "scanning").as((s) => (s ? spinner.start : spinner.stop))
		}}
	/>;

	const refresh = (
		<stack visible={true} halign={END} visible_child_name={bind(wifi, "scanning").as((s) => (s ? "refreshspinner" : "refreshbtn"))} homogeneous={false}>
			{theSpinner}
			<button
				name={"refreshbtn"}
				onClick={(_, event) => {
					if (event.button === Gdk.BUTTON_PRIMARY) {
						if (wifi.enabled && !wifi.scanning) {
							wifi.scan();
						}
					}
				}}
				halign={CENTER}
				valign={CENTER}
				tooltip_text={bind(wifi, "scanning").as((v) => (v ? "wifi scanning" : ""))}
			>
				<icon icon={"view-refresh-symbolic"} halign={CENTER} valign={CENTER} />
			</button>
		</stack>
	);
	const enable = (
		<button
			onClick={(_, event) => {
				if (event.button === Gdk.BUTTON_PRIMARY) {
					// execAsync(`nmcli radio wifi ${wifi.enabled ? "off" : "on"}`);
					wifi.enabled = !wifi.enabled;
				}
			}}
			halign={CENTER}
			valign={CENTER}
			tooltip_text={bind(wifi, "enabled").as((v) => (v ? "Disable" : "Enable"))}
		>
			<icon icon={bind(wifi, "enabled").as((v) => (v ? Icon.network.wifi.enabled : Icon.network.wifi.disabled))} halign={END} valign={CENTER} />
		</button>
	);
	const head = <label label={"Wi-Fi"} halign={CENTER} valign={CENTER} />;

	return (
		<centerbox
			className={"wifi header"}
			halign={FILL}
			valign={FILL}
			vertical={false}
			centerWidget={head}
			endWidget={
				<box halign={CENTER} vertical={false} spacing={15}>
					{enable}
					{refresh}
				</box>
			}
		/>
	);
}

function WifiAP(ap: any, wifi: AstalNetwork.Wifi) {
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

	const APEntry = () => {
		const label = Variable.derive(
			[bind(ap, "ssid"), bind(ap, "frequency"), bind(ap, "maxBitrate")],
			(ssid, frequency, maxBitrate) => {
				const frequencyGHz = (frequency / 1000).toFixed(1) + "GHz";
				const maxBitrateMbps = (maxBitrate / 1000).toFixed(0) + "Mbps";
				return [ssid, frequencyGHz, maxBitrateMbps].join(" - ");
			}
		)();

		return (
			<box vertical={false} spacing={5} halign={FILL} valign={CENTER}
				tooltip_text={isActiveAP ? "" : SecuredAP ? "Secured: Password Required" : "Unsecured"}
			>
				<icon icon={ap.icon_name} valign={CENTER} halign={START} />
				<label label={label} valign={CENTER} halign={START} />
			</box>
		);
	};

	const theSpinner = <Spinner
		name={"connectionSpinner"}
		setup={(spinner) => isConnecting ? spinner.start() : spinner.stop()}
		halign={CENTER}
		valign={CENTER}
	/>

	const button = (Action: "connect" | "disconnect" | "forget") => {
		const halign = Action === "connect" ? START : END;

		const content = (() => {
			switch (Action) {
				case "connect":
					return <APEntry />;
				case "disconnect":
					return <icon icon={"circle-x-symbolic"} />;
				case "forget":
					return <icon icon={"edit-delete-symbolic"} />;
			}
		})();

		const command = (() => {
			const notify = async (title: string, message: string, urgency: string = "normal") => {
				await execAsync(`notify-send -u ${urgency} "${title}" "${message}"`);
			};

			const handleError = async (action: string, error: any) => {
				await notify("WiFi Error", `Failed to ${action} ${ap.ssid}: ${error}`, "critical");
				console.error(`Failed to ${action} ${ap.ssid}: ${error}`);
			};

			switch (Action) {
				case "connect":
					return async () => {
						if (SecuredAP && !isActiveAP) {
							const hasStoredPassword = await checkStoredPassword(ap.ssid);
							if (hasStoredPassword) {
								try {
									await execAsync(`nmcli con up "${ap.ssid}"`);
									await notify("WiFi", `Connected to ${ap.ssid}`);
								} catch (error) {
									await handleError("connect to", error);
								}
							} else {
								passreveal.set(!passreveal.get());
								PasswordEntry.grab_focus();
							}
						} else if (!isActiveAP) {
							await execAsync(`nmcli con up "${ap.ssid}"`);
						}
					};
				case "disconnect":
					return async () => {
						try {
							await execAsync(`nmcli con down "${ap.ssid}"`);
							await notify("WiFi", `Disconnected from ${ap.ssid}`);
						} catch (error) {
							await handleError("disconnect", error);
						}
					};
				case "forget":
					return async () => {
						try {
							await execAsync(`nmcli connection delete "${ap.ssid}"`);
							await notify("WiFi", `Forgot ${ap.ssid}`);
						} catch (error) {
							await handleError("forget", error);
						}
					};
				default:
					return () => { };
			}
		})();

		const classname = (() => {
			const classnameMap: { [key: string]: string } = {
				connect: "connect",
				disconnect: "disconnect",
				forget: "forget",
			};
			return classnameMap[Action] || "";
		})();

		const tooltip = (() => {
			const sap = SecuredAP ? "Secured: Password Required" : "Unsecured"
			const tooltipMap: { [key: string]: string } = {
				connect: sap,
				disconnect: "Disconnect",
				forget: "Forget/ Delete AP",
			};
			return tooltipMap[Action] || "";
		})();

		const visible = (() => {
			switch (Action) {
				case "connect": return true;
				case "disconnect": return isActiveAP;
				case "forget": return isActiveAP;
				default:
					return false;
			}
		})();

		return (
			<button
				className={`wifi ap ${classname}`}
				onClick={(_, event) => {
					if (event.button === Gdk.BUTTON_PRIMARY) {
						command()
					}
				}}
				tooltip_text={tooltip}
				halign={halign}
				valign={CENTER}
				cursor={"pointer"}
				visible={visible}
				height_request={10}
			>
				{content}
			</button>
		);
	}

	return (
		<box vertical={true}>
			<centerbox
				height_request={20}
				className={`wifi ap ${isActiveAP ? "connected" : ""}`}
				halign={FILL}
				valign={FILL}
				startWidget={button("connect")}
				endWidget={
					<stack
						className={"wifi connected controls"}
						visible={isActiveAP || isConnecting}
						halign={END}
						visible_child_name={isConnecting ? "connectionSpinner" : "controls"}
						homogeneous={false}
					>
						<box name={"connectionSpinner"} halign={END}>
							{theSpinner}
							<label label={"Connecting..."} halign={END} valign={CENTER} />
						</box>
						<box name={"controls"} halign={END} spacing={5}>
							{button("disconnect")}
							{button("forget")}
						</box>
					</stack>
				}
			/>
			{PasswordEntry}
		</box>
	)
}

export default function WifiAPs() {
	const Network = AstalNetwork.get_default();
	const Wifi = Network.wifi;

	const APList = bind(Wifi, "accessPoints").as((aps) => {
		const activeAP = Wifi.active_access_point || null;

		const groupedAPs = aps.reduce((acc: any, ap: any) => {
			const ssid = ap.ssid ? ap.ssid.trim() : null;
			if (!ssid) return acc;

			if (!acc[ssid]) {
				acc[ssid] = [];
			}
			acc[ssid].push(ap);

			return acc;
		}, {});

		const sortedAPGroups = Object.values(groupedAPs).map((apGroup: any) => {
			apGroup.sort((a: any, b: any) => {
				if (a === activeAP) return -1;
				if (b === activeAP) return 1;

				return b.strength - a.strength;
			});

			return apGroup[0];
		});

		sortedAPGroups.sort((a, b) => {
			if (a === activeAP) return -1;
			if (b === activeAP) return 1;

			return b.strength - a.strength;
		});

		return sortedAPGroups.map((ap) => WifiAP(ap, Wifi));
	});

	return (
		<box className={"network wifi container"} halign={FILL} valign={FILL} hexpand={true} visible={true} vertical={true} spacing={10}>
			{Header(Wifi)}
			<scrollable halign={FILL} valign={FILL} visible={true} vscroll={Gtk.PolicyType.AUTOMATIC} hscroll={Gtk.PolicyType.NEVER} vexpand={true}>
				<box className={"wifi aplist-inner"} halign={FILL} valign={FILL} visible={true} vertical={true} spacing={5}>
					{APList}
				</box>
			</scrollable>
		</box>
	);
}