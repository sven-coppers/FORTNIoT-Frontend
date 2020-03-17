class GenericDeviceTimeline extends DeviceTimeline {
    constructor(identifier: string, friendlyName: string, icon: string, containerTimeline: Timeline) {
        super(containerTimeline, identifier);

        this.components = [];
        this.components.push(new StateComponent(this, this.getMainAttributeContainer(), friendlyName, null, icon));
    }
}