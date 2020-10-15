class ContactTimeline extends DeviceTimeline {
    constructor(mainController: IoTController, identifier: string, friendlyName: string, containerTimeline: Timeline) {
        super(containerTimeline, identifier);

        this.components = [];
        this.components.push(new ContactComponent(mainController, this, this.getMainAttributeContainer(), friendlyName));
    }
}