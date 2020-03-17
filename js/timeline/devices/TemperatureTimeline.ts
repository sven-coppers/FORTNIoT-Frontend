class TemperatureTimeline extends DeviceTimeline {
    constructor(identifier: string, friendlyName: string, containerTimeline: Timeline) {
        super(containerTimeline, identifier);

        this.components = [];
        this.components.push(new TemperatureComponent(this, this.getMainAttributeContainer(), friendlyName));
    }
}