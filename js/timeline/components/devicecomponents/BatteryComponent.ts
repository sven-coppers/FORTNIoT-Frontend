class BatteryComponent extends GraphComponent {
    constructor(mainController: IoTController, parentDevice: DeviceTimeline, parentElement: JQuery, label: string) {
        super(mainController, parentDevice, parentElement, label, null, "battery.png");
    }

    getDefaultOptions() {
        let options = super.getDefaultOptions();

        options["dataAxis"] = {showMajorLabels: true, left: {range: {min: -25, max: 125}}};

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

    valueToLabel(value) {
        if(value < 30) {
            return {content: value.toFixed(0), xOffset: -5, yOffset: -10};
        } else {
            return {content: value.toFixed(0), xOffset: -5, yOffset: 18};
        }
    }
}