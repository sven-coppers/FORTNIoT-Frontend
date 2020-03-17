class ContactTimeline extends DeviceTimeline {
    constructor(identifier: string, friendlyName: string, containerTimeline: Timeline) {
        super(containerTimeline, identifier);

        this.components = [];
        this.components.push(new ContactComponent(this, this.getMainAttributeContainer(), friendlyName));
    }
}