class MoonTimeline extends DeviceTimeline {
    constructor(identifier: string, friendlyName: string, containerTimeline: Timeline) {
        super(containerTimeline, identifier);

        this.components = [];
        this.components.push(new StateComponent(this, this.getMainAttributeContainer(), friendlyName, null, "moon.png"));
    }
}