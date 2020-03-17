class CalendarComponent extends StateComponent {
    constructor(parentDevice: DeviceTimeline, parentElement: JQuery, label: string) {
        super(parentDevice, parentElement, label, "appointments", "cal.png");
    }

    redraw(deviceChanges: any) {
        this.items.clear();
        if (deviceChanges.length == 0) return;

        let startIndex = -1;

        for (let i = 0; i < deviceChanges.length; i++) {
            if (deviceChanges[i]["state"] == "on") {
                startIndex = i;
            } else if (deviceChanges[i]["state"] == "off" && startIndex > -1) {
                this.items.add(this.jsonToItem(deviceChanges[startIndex], deviceChanges[startIndex]["last_changed"], deviceChanges[i]["last_changed"]));
            }
        }
    }

    jsonToItem(json, startTime, endTime): any {
        return {
            id: json["context"]["id"],
            group: 1,
            content: this.createHTML(json["attributes"]["message"], true, ""),
            start: startTime,
            end: endTime,
            type: 'range'
        };
    }
}