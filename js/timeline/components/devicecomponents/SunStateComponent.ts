class SunStateComponent extends StateComponent {
    constructor(mainController: IoTController, parentDevice: DeviceTimeline, parentElement: JQuery, label: string) {
        super(mainController, parentDevice, parentElement, label, "state", "sun.png");
    }

    jsonToLabel(json) {
        if(json["state"] == "above_horizon") return "Above horizon";
        if(json["state"] == "below_horizon") return "Below horizon";

        return json["state"];
    }
}