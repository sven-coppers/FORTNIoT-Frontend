class MotionTimeline extends DeviceTimeline {
    constructor(identifier: string, friendlyName: string, containerTimeline: Timeline) {
        super(containerTimeline, identifier);

        this.components = [];
        this.components.push(new MotionComponent(this, this.getMainAttributeContainer(), friendlyName));
    }
}