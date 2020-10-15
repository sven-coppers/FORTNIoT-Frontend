class ContinuousGraphComponent extends GraphComponent {
    constructor(mainController: IoTController, parentDevice: DeviceTimeline, parentElement: JQuery, label: string, property: string, icon: string) {
        super(mainController, parentDevice, parentElement, label, property, icon);
    }



    /*let groups = new vis.DataSet();
    groups.add([
                   { id: 1, content: "Temperature",  options: { interpolation: false}},
               ]);

    let options = this.getDefaultGraphOptions();

    this.temperatureGraph = new vis.Graph2d(document.getElementById('weather_temperature_graph'));
    this.temperatureGraph.setOptions(options);
    this.temperatureGraph.setGroups(groups); */

   /* initVisualisation(DOMElementID: string) {
        this.items = new vis.DataSet();
        this.groups = new vis.DataSet();

        this.groups.add([
            { id: 1, content: "Continuous Graph", options: {
                    interpolation: {
                        parametrization: 'uniform'
                    },
                    shaded: {
                        orientation: 'zero'
                    }
                }}
        ]);

        this.visualisation = new vis.Graph2d(document.getElementById(DOMElementID));
        this.visualisation.setOptions(this.getDefaultOptions());
        this.visualisation.setGroups(this.groups);
        this.visualisation.setItems(this.items);
    } */
}