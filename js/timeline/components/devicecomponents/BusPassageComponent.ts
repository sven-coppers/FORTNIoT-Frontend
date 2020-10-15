class BusPassageComponent extends StateComponent {
    constructor(mainController: IoTController, parentDevice: DeviceTimeline, parentElement: JQuery, label: string, property: string) {
        super(mainController, parentDevice, parentElement, label, property, "bus.png");
    }

    jsonToItem(json, id, startTime, endTime): any {
        return {
            id: id,
            group: 1,
            content: this.createHTML(id, json["state"], true, json["future"]),
            start: startTime,
            end: new Date(new Date(startTime).getTime() + 30000),
            type: 'range'
        };
    }
}