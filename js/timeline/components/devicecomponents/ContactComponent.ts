class ContactComponent extends StateComponent {
    constructor(parentDevice: DeviceTimeline, parentElement: JQuery, label: string) {
        super(parentDevice, parentElement, label, "contact", "contact.png");
    }

    jsonToLabel(json) {
        if(json["state"] == "off") return "Closed";
        if(json["state"] == "on") return "Open";

        return json["state"];
    }
}