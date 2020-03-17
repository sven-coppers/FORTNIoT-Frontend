class AxisTimeline extends DeviceTimeline {
    constructor(containerTimeline: Timeline) {
        super(containerTimeline, "timeline.axis");

        this.components = [];
        this.components.push(new AxisComponent(this, this.getMainAttributeContainer(), ''));
    }
}