class DiscreteGraphComponent extends GraphComponent {
    protected constructor(mainController: IoTController, parentDevice: DeviceTimeline, parentElement: JQuery, label: string, property: string, icon: string) {
        super(mainController, parentDevice, parentElement, label, property, icon);
    }

    initVisualisation(DOMElementID: string) {
        this.groups = new vis.DataSet();
        this.groups.add([{
            id: 1,
            content: "Brightness",
            options: {
                interpolation: false,
                dataAxis: {
                    left: {
                        range: {min: 0, max: 1}
                    }
                }
            }
        }]);

        this.visualisation = new vis.Graph2d(document.getElementById(DOMElementID));
        this.visualisation.setOptions(this.getDefaultOptions());
        this.visualisation.setGroups(this.groups);
    }

    jsonToItem(json, startTime, endTime): any {
    }

    areDifferent(firstJson, secondJson): boolean {
        return false;
    }
}