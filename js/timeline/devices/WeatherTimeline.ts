class WeatherTimeline extends DeviceTimeline {
    constructor(identifier: string, containerTimeline: Timeline) {
        super(containerTimeline, identifier);

        this.components = [];
        this.components.push(new WeatherStateComponent(this, this.getMainAttributeContainer(), 'Weather'));
       // this.components.push(new TemperatureComponent(this, this.getOtherAttributesContainer(), 'Temperature'));
    }
}