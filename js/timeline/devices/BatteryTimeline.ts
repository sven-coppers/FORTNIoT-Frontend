class BatteryTimeline extends DeviceTimeline {
    constructor(identifier: string, friendlyName: string, containerTimeline: Timeline) {
        super(containerTimeline, identifier);

        this.components = [];
        this.components.push(new BatteryComponent(this, this.getMainAttributeContainer(), friendlyName));
        //  this.components.push(new MotionComponent(this, this.getOtherAttributesContainer(), 'Temperature'));


        //    this.components.push(new ContinuousGraphComponent(this, this.getOtherAttributesContainer(), 'Temperature'));
    }


}