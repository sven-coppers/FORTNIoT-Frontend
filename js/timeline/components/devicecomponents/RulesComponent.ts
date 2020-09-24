class RulesComponent extends StateComponent {
    constructor(parentDevice: DeviceTimeline, parentElement: JQuery, label: string) {
        super(parentDevice, parentElement, label, "axis", null);
    }

    initVisualisation(DOMElementID: string) {
        var sdt = [{
            "group3": [
                {
                    id: 1525,
                    treeLevel: 3,
                    content: "Level 3 1525"
                }, {
                    id: 1624,
                    treeLevel: 3,
                    content: "Level 3 1624"
                }, {
                    id: 2107,
                    treeLevel: 3,
                    content: "Level 3 2107"
                }],
            "groups": [{
                id: 10,
                title: "Rule 1",
                content: "Rule 1",
                treeLevel: 1,
                nestedGroups: [1, 2]
            }, {
                id: 1,
                content: "Action R1A1",
                treeLevel: 2,
                nestedGroups: [1525, 1624, 2107]
            }, {
                id: 2,
                treeLevel: 2,
                content: "Action R1A2"
            }, {
                id: 100,
                title: "Rule 2",
                content: "Rule 2",
                treeLevel: 1,
                nestedGroups: [101, 102],
                "text": "Totals",
                "EditionId": 0,
                "groupId": 0
            }, {
                id: 101,
                treeLevel: 2,
                content: "R2A1"
            }, {
                id: 102,
                treeLevel: 2,
                content: "R2A2"
            }],
        }];



        this.groups = new vis.DataSet();
        this.groups.add(sdt[0].groups);
        this.groups.add(sdt[0].group3);

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
