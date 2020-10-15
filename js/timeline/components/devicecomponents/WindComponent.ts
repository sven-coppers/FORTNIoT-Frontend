class WindComponent extends ContinuousGraphComponent {
    constructor(mainController: IoTController, parentDevice: DeviceTimeline, parentElement: JQuery, label: string) {
        super(mainController, parentDevice, parentElement, label, null, "wind.png");
    }

    getDefaultOptions() {
        let options = super.getDefaultOptions();

        options["dataAxis"] = {showMajorLabels: true, left: {range: {min: -50, max: 150}}};

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
        return {content: value.toFixed(0), xOffset: -5, yOffset: 18};
    }
}