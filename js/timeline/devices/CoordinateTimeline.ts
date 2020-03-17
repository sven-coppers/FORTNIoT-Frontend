class CoordinateTimeline extends DeviceTimeline {
    constructor(identifier: string, friendlyName: string, containerTimeline: Timeline) {
        super(containerTimeline, identifier);

        this.components = [];
        this.components.push(new CoordinateComponent(this, this.getMainAttributeContainer(), friendlyName));
    }
}