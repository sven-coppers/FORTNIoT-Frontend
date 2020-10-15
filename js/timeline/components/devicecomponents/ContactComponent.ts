class ContactComponent extends StateComponent {
    constructor(mainController: IoTController, parentDevice: DeviceTimeline, parentElement: JQuery, label: string) {
        super(mainController, parentDevice, parentElement, label, "contact", "contact.png");
    }

    jsonToLabel(json) {
        if(json["state"] == "off") return "Closed";
        if(json["state"] == "on") return "Open";

        return json["state"];
    }
}