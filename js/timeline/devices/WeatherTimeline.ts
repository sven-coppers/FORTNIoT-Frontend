class WeatherTimeline extends DeviceTimeline {
    constructor(mainController: IoTController, identifier: string, containerTimeline: Timeline) {
        super(containerTimeline, identifier);

        this.components = [];
        this.components.push(new WeatherStateComponent(mainController, this, this.getMainAttributeContainer(), 'Weather'));
       // this.components.push(new TemperatureComponent(this, this.getOtherAttributesContainer(), 'Temperature'));
    }
}