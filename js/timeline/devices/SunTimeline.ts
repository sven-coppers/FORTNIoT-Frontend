class SunTimeline extends DeviceTimeline {
    constructor(identifier: string, containerTimeline: Timeline) {
        super(containerTimeline, identifier);
        this.components = [];
        this.components.push(new SunStateComponent(this, this.getMainAttributeContainer(), 'Sun'));
        this.components.push(new ContinuousGraphComponent(this, this.getOtherAttributesContainer(), "Elevation ", "elevation", null));
    }
}