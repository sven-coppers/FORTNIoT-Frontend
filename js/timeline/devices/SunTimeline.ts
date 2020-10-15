class SunTimeline extends DeviceTimeline {
    constructor(mainController: IoTController, identifier: string, containerTimeline: Timeline) {
        super(containerTimeline, identifier);
        this.components = [];
        this.components.push(new SunStateComponent(mainController, this, this.getMainAttributeContainer(), 'Sun'));
        this.components.push(new ContinuousGraphComponent(mainController, this, this.getOtherAttributesContainer(), "Elevation ", "elevation", null));
    }
}