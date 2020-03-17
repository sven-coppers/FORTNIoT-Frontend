class TemperatureComponent extends ContinuousGraphComponent {
    constructor(parentDevice: DeviceTimeline, parentElement: JQuery, label: string) {
        super(parentDevice, parentElement, label, null, "temperature.png");
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