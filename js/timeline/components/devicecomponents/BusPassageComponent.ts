class BusPassageComponent extends StateComponent {
    constructor(parentDevice: DeviceTimeline, parentElement: JQuery, label: string, property: string) {
        super(parentDevice, parentElement, label, property, "bus.png");
    }

    jsonToItem(json, id, startTime, endTime): any {
        return {
            id: id,
            group: 1,
            content: this.createHTML(json["state"], true, json["future"]),
            start: startTime,
            end: new Date(new Date(startTime).getTime() + 30000),
            type: 'range'
        };
    }
}