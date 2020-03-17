class CalendarTimeline extends DeviceTimeline {

    constructor(identifier: string, friendlyName: string, containerTimeline: Timeline) {
        super(containerTimeline, identifier);

        this.components = [];
        this.components.push(new CalendarComponent(this, this.getMainAttributeContainer(), friendlyName));
    }
}