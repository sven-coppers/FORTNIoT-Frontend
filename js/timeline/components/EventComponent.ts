class EventComponent extends StateComponent {
    constructor(parentDevice: DeviceTimeline, parentElement: JQuery, label: string, icon: string) {
        super(parentDevice, parentElement, label, "events", icon);
    }

    initVisualisation(DOMElementID: string) {
        this.items = new vis.DataSet();
        this.groups = new vis.DataSet();
        this.groups.add([{ id: 1, content: ''}]);

        let options = this.getDefaultOptions();

        options["editable"] = true;

        // Create a Timeline
        this.visualisation = new vis.Timeline(document.getElementById(DOMElementID));
        this.visualisation.setOptions(options);
        this.visualisation.setGroups(this.groups);
        this.visualisation.setItems(this.items);
    }

    itemClicked(properties) {
        let executionID: string = properties.item;
        // DEPRECATED? OR SHOULD BE RE IMPLEMENTED
        //this.parentDevice.containerTimeline.executionClicked(executionID);
    }

    redraw(deviceChanges: any) {
        this.items.clear();

        for(let i = 0; i < deviceChanges.length; i++) {
            let newItem = {
                id: deviceChanges[i]["execution_id"],
                group: 1,
                content: this.createHTML(deviceChanges[i]["execution_id"]),
                start: deviceChanges[i]["datetime"],
                type: 'point'
            };
            this.items.add(newItem);
        }
    }

    selectAction(identifier: string) {
        // Not supported for events
    }

    selectTrigger(identifier: string) {
        // Not supported for events
    }

    selectExecution(identifier: string) {
        let item = this.visualisation.itemsData.get(identifier);

        if(item != null) {
            item["content"] = item["content"].replace("event_item", "event_item selected");
            this.items.update(item);
            this.parentDevice.setVisible(true);
        }
    }

    createHTML(executionID: string) : string {
        let result : string = "";

    //    if(this.parentDevice.containerTimeline.anyActionsVisible(executionID)) {
            result += '<div class="event_item" id="' + executionID + '">&nbsp;</div>';
    /*    } else {
            result += '<div class="event_item without_changes">&nbsp;</div>';
        }*/

        return result;
    }
}