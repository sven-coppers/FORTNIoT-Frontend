class ThermostatTimeline extends DeviceTimeline {
    constructor(identifier: string, friendlyName: string, containerTimeline: Timeline) {
        super(containerTimeline, identifier);

        this.components = [];
        this.components.push(new ThermostatComponent(this, this.getMainAttributeContainer(), friendlyName));
    }
}