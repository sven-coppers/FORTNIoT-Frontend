class DeviceTrackerComponent extends StateComponent {
    constructor(parentDevice: DeviceTimeline, parentElement: JQuery, label: string) {
        super(parentDevice, parentElement, label, null, "tracker.png");
    }

    jsonToLabel(json) {
        return capitalizeFirstLetter(json["state"]);
    }
}