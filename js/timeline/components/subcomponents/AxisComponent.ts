class AxisComponent extends StateComponent {
    constructor(parentDevice: DeviceTimeline, parentElement: JQuery, label: string) {
        super(parentDevice, parentElement, label, "axis", null);
    }

    initVisualisation(DOMElementID: string) {
        this.groups = new vis.DataSet();
        this.groups.add([{ id: 1, content: ''}]);

        this.options = this.getDefaultOptions();
        this.options["showMajorLabels"] = true;
        this.options["showMinorLabels"] = true;

        this.visualisation = new vis.Timeline(document.getElementById(DOMElementID));
        this.visualisation.setOptions(this.options);
        this.visualisation.setGroups(this.groups);

        this.setItems();
    }

    setItems() {
        let items = [];

        items.push({
            id: 1,
            group: 1,
            content: "Clicked",
            start: this.options.min,
            end: this.options.min,
            type: 'range'
        }, {
            id: 2,
            group: 1,
            content: "Clicked",
            end: this.options.max,
            start: this.options.max,
            type: 'range'
        });

        this.visualisation.setItems(items);
    }

    itemClicked(properties) {
        return false;
    }
}
