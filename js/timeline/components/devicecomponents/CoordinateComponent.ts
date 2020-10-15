class CoordinateComponent extends ContinuousGraphComponent {
    constructor(mainController: IoTController, parentDevice: DeviceTimeline, parentElement: JQuery, label: string) {
        super(mainController, parentDevice, parentElement, label, null, "coordinate.png");
    }

    getDefaultOptions() {
        let options = super.getDefaultOptions();

        options["dataAxis"] = {showMajorLabels: true, left: {range: {min: -1500, max: 1500}}};

        return options;
    }
}