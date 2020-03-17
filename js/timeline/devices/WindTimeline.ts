class WindTimeline extends DeviceTimeline {
    constructor(identifier: string, friendlyName: string, containerTimeline: Timeline) {
        super(containerTimeline, identifier);

        this.components = [];
        this.components.push(new WindComponent(this, this.getMainAttributeContainer(), friendlyName));
    }
}