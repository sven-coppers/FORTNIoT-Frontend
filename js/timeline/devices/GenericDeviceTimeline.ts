class GenericDeviceTimeline extends DeviceTimeline {
    constructor(mainController: IoTController, identifier: string, friendlyName: string, icon: string, containerTimeline: Timeline) {
        super(containerTimeline, identifier);

        this.components = [];
        this.components.push(new StateComponent(mainController, this, this.getMainAttributeContainer(), friendlyName, null, icon));
    }
}