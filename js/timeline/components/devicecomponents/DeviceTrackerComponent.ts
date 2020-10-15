class DeviceTrackerComponent extends StateComponent {
    constructor(mainController: IoTController, parentDevice: DeviceTimeline, parentElement: JQuery, label: string) {
        super(mainController, parentDevice, parentElement, label, null, "tracker.png");
    }

    jsonToLabel(json) {
        return capitalizeFirstLetter(json["state"]);
    }
}