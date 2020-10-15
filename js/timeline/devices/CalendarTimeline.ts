class CalendarTimeline extends DeviceTimeline {
    constructor(mainController: IoTController, identifier: string, friendlyName: string, containerTimeline: Timeline) {
        super(containerTimeline, identifier);

        this.components = [];
        this.components.push(new CalendarComponent(mainController, this, this.getMainAttributeContainer(), friendlyName));
    }
}