class OutletTimeline extends DeviceTimeline {
    constructor(identifier: string, deviceName: string, containerTimeline: Timeline) {
        super(containerTimeline, identifier);

        this.components = [];
        this.components.push(new StateComponent(this, this.getMainAttributeContainer(), deviceName, "state", "outlet.png"));
    }
}