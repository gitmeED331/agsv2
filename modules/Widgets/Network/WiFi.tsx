import { Gtk, Gdk } from "astal/gtk3";
import { execAsync, bind, Variable } from "astal";
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
		<stack visible halign={END} visible_child_name={bind(wifi, "scanning").as((s) => (s ? "refreshspinner" : "refreshbtn"))} homogeneous={false}>
			{theSpinner}
			<button
				name={"refreshbtn"}
				onClick={(_, event) => {
					if (event.button === Gdk.BUTTON_PRIMARY) {
						wifi.scan();
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
					wifi.enabled = !wifi.enabled


				}
			}}
			halign={CENTER}
			valign={CENTER}
			tooltip_text={bind(wifi, "enabled").as((v) => (v ? "Disable" : "Enable"))}
		>
			<icon icon={bind(wifi, "icon_name")} halign={END} valign={CENTER} />
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
	);

	const PasswordReveal = (
		<revealer halign={FILL} valign={FILL} transitionType={Gtk.RevealerTransitionType.SLIDE_DOWN} transitionDuration={300} revealChild={bind(passreveal)} visible={bind(passreveal)}>
			{PasswordEntry}
		</revealer>
	);

	const APEntry = () => {
		const IconLabel = (
			<box vertical={false} spacing={5} halign={START} valign={CENTER}>
				<icon icon={ap.icon_name} valign={CENTER} />
				<label label={ap.ssid} valign={CENTER} ellipsize={Pango.EllipsizeMode.MIDDLE} tooltip_text={isActiveAP ? "" : SecuredAP ? "Secured: Password Required" : "Unsecured"} />
				<label label={(ap.frequency / 1000).toFixed(1) + "GHz"} valign={CENTER} />
				<label label={(ap.maxBitrate / 1000).toFixed(0) + "Mbps"} valign={CENTER} />
			</box>
		);

		return (
			<button
				halign={FILL}
				valign={CENTER}
				cursor={"pointer"}
				onClick={async (_, event) => {
					if (event.button === Gdk.BUTTON_PRIMARY) {
						if (SecuredAP) {
							const hasStoredPassword = await checkStoredPassword(ap.ssid);
							if (hasStoredPassword) {
								execAsync(`nmcli con up "${ap.ssid}"`).then(
									() => execAsync(`notify-send "WiFi" "Connected to ${ap.ssid}"`),
									(error) => execAsync(`notify-send -u critical "WiFi Error" "Failed to connect to ${ap.ssid}"`),
								);
							} else {
								passreveal.set(true);
								PasswordEntry.grab_focus();
							}
						} else {
							execAsync(`nmcli con up ${ap.ssid}`);
						}
					}
				}}
			>
				{IconLabel}
			</button>
		);
	};

	const APDisconnect = (
		<button
			className={"wifi ap disconnect"}
			onClick={(_, event) => {
				if (event.button === Gdk.BUTTON_PRIMARY) {
					execAsync(`nmcli con down ${ap.ssid}`).then(
						() => {
							execAsync(`notify-send "WiFi" "Disconnected from ${ap.ssid}"`);
						},
						(error) => {
							execAsync(`notify-send -u critical "WiFi Error" "Failed to Disconnect ${ap.ssid}: ${error}"`);
							console.error(`Failed to Disconnect ${ap.ssid}: ${error}`);
						},
					);
				}
			}}
			halign={END}
			valign={CENTER}
			tooltip_text={"Disconnect"}
			cursor={"pointer"}
			visible={isActiveAP}
		>
			<icon icon={"circle-x-symbolic"} halign={END} valign={CENTER} />
		</button>
	);

	const APForget = (
		<button
			className={"wifi ap forget"}
			onClick={(_, event) => {
				if (event.button === Gdk.BUTTON_PRIMARY) {
					execAsync(`nmcli connection delete ${ap.ssid}`).then(
						() => {
							execAsync(`notify-send "WiFi" "Forgot ${ap.ssid}"`);
						},
						(error) => {
							execAsync(`notify-send -u critical "WiFi Error" "Failed to forget ${ap.ssid}"`);
							console.error(`Failed to forget ${ap.ssid}: ${error}`);
						},
					);
				}
			}}
			halign={END}
			valign={CENTER}
			tooltip_text={"Forget/Delete SSID"}
			cursor={"pointer"}
			visible={isActiveAP}
		>
			<icon icon={"edit-delete-symbolic"} halign={END} valign={CENTER} />
		</button>
	);
	function spinSetup(spinner: Spinner) {
		isConnecting ? spinner.start() : spinner.stop();
	}
	const theSpinner = new Spinner({
		name: "connectionSpinner",
		setup: spinSetup,
		halign: CENTER,
		valign: CENTER,
	});
	const APItem = (
		<box vertical={true}>
			<centerbox
				className={`wifi ap ${isActiveAP ? "connected" : ""}`}
				vertical={false}
				halign={FILL}
				valign={FILL}
				startWidget={APEntry()}
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
							{APDisconnect}
							{APForget}
						</box>
					</stack>
				}
			/>
			{PasswordReveal}
		</box>
	);

	return (
		<box vertical={true} spacing={10}>
			{APItem}
		</box>
	);
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
