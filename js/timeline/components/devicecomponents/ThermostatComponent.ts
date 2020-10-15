class ThermostatComponent extends ContinuousGraphComponent {
    constructor(mainController: IoTController, parentDevice: DeviceTimeline, parentElement: JQuery, label: string) {
        super(mainController, parentDevice, parentElement, label, null, "thermostat.png");
    }

    getDefaultOptions() {
        let options = super.getDefaultOptions();

        options["dataAxis"] = {showMajorLabels: true, left: {range: {min: -20, max: 40}}};

        // @ts-ignore
        options["drawPoints"] = function(item, group) {
            if(item["label"] == null) {
                return false;
            } else {
                return {style: "circle"};
            }
        };

        return options;
    }
}