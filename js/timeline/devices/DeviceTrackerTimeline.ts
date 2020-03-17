class DeviceTrackerTimeline extends DeviceTimeline {
    constructor(identifier: string, friendlyName: string, containerTimeline: Timeline) {
        super(containerTimeline, identifier);

        this.components = [];
        this.components.push(new DeviceTrackerComponent(this, this.getMainAttributeContainer(), friendlyName));
    }
}