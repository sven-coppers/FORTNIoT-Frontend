class MotionComponent extends StateComponent {
    constructor(parentDevice: DeviceTimeline, parentElement: JQuery, label: string) {
        super(parentDevice, parentElement, label, "motion", "motion.png");
    }

    jsonToLabel(json) {
        if(json["state"] == "off") return "Clear";
        if(json["state"] == "on") return "Movement";

        return json["state"];
    }
}