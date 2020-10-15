class AccelerationTimeline extends DeviceTimeline {
    constructor(mainController: IoTController, identifier: string, deviceName: string, containerTimeline: Timeline) {
        super(containerTimeline, identifier);

        this.components = [];
        this.components.push(new StateComponent(mainController, this, this.getMainAttributeContainer(), deviceName, null, "acceleration.png"));
    }
}