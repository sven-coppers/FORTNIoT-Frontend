class StateComponent extends TimelineComponent {
    constructor(parentDevice: DeviceTimeline, parentElement: JQuery, label: string, property: string, icon: string) {
        super(parentDevice, parentElement, label, property, icon);
    }

    getDefaultOptions() {
        return {
            autoResize: true,
            min: new Date(new Date().getTime() - 1000 * 60 * 60 * 4.5), // 4 hours before
            max: new Date(new Date().getTime() + 1000 * 60 * 60 * 24.5), // 1 days after
            stack: false, // Do not make the figure taller
            start: new Date(new Date().getTime() - 1000 * 60 * 60 * 4.5), // 4 hours before
            end: new Date(new Date().getTime() + 1000 * 60 * 60 * 24.5), //  1 days after
            // rollingMode: {follow: true, offset: 0.3},
            showMajorLabels: false,
            showMinorLabels: false,
            moment: function(date) {
                return vis.moment(date).utcOffset('+02:00');
            }
        };
    }

    initVisualisation(DOMElementID: string) {
        this.items = new vis.DataSet();
        this.groups = new vis.DataSet();
        this.groups.add([{ id: 1, content: ''}]);

        this.visualisation = new vis.Timeline(document.getElementById(DOMElementID));
        this.visualisation.setOptions(this.getDefaultOptions());
        this.visualisation.setGroups(this.groups);
        this.visualisation.setItems(this.items);
    }

    itemClicked(properties) {
        let parent = $(properties.event.path[0]).closest(".state_item_wrapper");
        let stateContextID = properties.item;

        $(".state_item_wrapper").removeClass("trigger action");
        $(".vis-point").removeClass("vis-selected");

        if(stateContextID != null) {
            this.parentDevice.containerTimeline.stateHighlighted(stateContextID);
        } else {
            this.parentDevice.containerTimeline.clearSelection(true);
        }
    }

    redraw(deviceChanges: any, feedforward: boolean) {
        let config: ConfigClient = this.parentDevice.containerTimeline.getConfigClient();

        this.items.clear();
        if(deviceChanges.length == 0) return;

        if(config.isPredictionEngineEnabled()) {
            let endDate: Date = new Date();
            endDate.setTime(new Date().getTime() + (config.predictionWindow * 60 * 1000)); // Convert minutes to milliseconds

            this.redrawWithPredictions(deviceChanges, feedforward, endDate)
        } else {
            this.redrawWithoutPredictions(deviceChanges, feedforward);
        }
    }

    private redrawWithPredictions(deviceChanges: any, feedforward: boolean, predictionEnd: Date) {
        for(let startIndex = 0; startIndex < deviceChanges.length ; ) {
            let found = false;

            for(let endIndex = startIndex + 1; endIndex < deviceChanges.length; endIndex++) {
                if(this.areDifferent(deviceChanges[startIndex], deviceChanges[endIndex])) {
                    this.items.add(this.jsonToItem(deviceChanges[startIndex], deviceChanges[startIndex]["context"]["id"], deviceChanges[startIndex]["last_changed"], deviceChanges[endIndex]["last_changed"]));
                    startIndex = endIndex;
                    found = true;
                    break;
                }
            }

            if(!found) { // THIS WAS THE LAST ELEMENT
                this.items.add(this.jsonToItem(deviceChanges[startIndex], deviceChanges[startIndex]["context"]["id"], deviceChanges[startIndex]["last_changed"], predictionEnd));
                break;
            }
        }
    }

    private redrawWithoutPredictions(deviceChanges: any, feedforward: boolean) {
        let beginIndex = 0;
        let idSuffix = "";

        for(let i = 1; i < deviceChanges.length; i++) {
            if(this.areDifferent(deviceChanges[beginIndex], deviceChanges[i]) || i == deviceChanges.length - 2) {
                while(this.items.get(deviceChanges[beginIndex]["context"]["id"] + idSuffix) != null) { // THIS IS A SHITTY HACK TO PREVENT CRASHES ON DUPLICATE IDs
                  //  idSuffix += "a";
                }

                this.items.add(this.jsonToItem(deviceChanges[beginIndex], deviceChanges[beginIndex]["context"]["id"] + idSuffix, deviceChanges[beginIndex]["last_changed"], deviceChanges[i]["last_changed"]));
                beginIndex = i;
            }
        }

        let lastState = deviceChanges[deviceChanges.length - 1];

        // If the last state started in the past, the device still has that state,
        if(Date.parse(lastState["last_changed"]) < new Date().getTime()) {
            this.items.add(this.jsonToItem(lastState, lastState["context"]["id"], lastState["last_changed"], new Date()));

            // And we don't know when it will end
            // this.items.add(this.jsonToItem(lastState, lastState["context"]["id"] + "b", new Date(), null));
        } else {
            // If the last state started in the future, we don not know when it will end
            this.items.add(this.jsonToItem(deviceChanges[beginIndex], deviceChanges[beginIndex]["context"]["id"], deviceChanges[beginIndex]["last_changed"], null));
        }
    }

    selectAction(identifier: string) {
        let item = this.visualisation.itemsData.get(identifier);

        if(item != null) {
            item["content"] = item["content"].split("trigger").join("").replace("state_item_wrapper", "state_item_wrapper action");
            this.items.update(item);
            this.parentDevice.setVisible(true);
        }
    }

    selectTrigger(identifier: string) {
        let item = this.visualisation.itemsData.get(identifier);

        if(item != null) {
            item["content"] = item["content"].split("action").join("").replace("state_item_wrapper", "state_item_wrapper trigger");
            this.items.update(item);
            this.parentDevice.setVisible(true);
        }
    }

    selectExecution(identifier: string) {
        // Not supported for states
    }

    areDifferent(firstJson, secondJson): boolean {
        return firstJson["state"] !== secondJson["state"];// || firstJson["future"] !== secondJson["future"];
    }

    jsonToItem(json, id, startTime, endTime): any {
        let label = this.jsonToLabel(json);

        let item = {
            id: id,
            group: 1,
            start: startTime
        };

        if(endTime != null) {
            item["end"] = endTime;
            item["type"] = 'range';
            item["content"] = this.createHTML(label, true, json["future"]);
        } else {
            item["type"] = 'point';
            item["content"] = this.createHTML(label, false, json["future"]);
        }

        return item;
    }

    jsonToLabel(json) {
        return capitalizeFirstLetter(json["state"].replace("_", " "));
    }

    createHTML(content: string, hasEnd: boolean, future: string) : string {
        let additionalClasses: string = "";

        if(!hasEnd) {
            additionalClasses += " unfinished";
        }

        if(typeof future !== "undefined") {
            additionalClasses += " " + future.toLowerCase();
        }

        let result = '<div class="state_item_wrapper' + additionalClasses + '">';
        result += '    <div class="state_item_icon"><img src="img/warning.png" /></div>';
        result += '    <div class="state_item_arrow">&nbsp;</div>';
        result += '    <div class="state_item_content">' + content + '</div>';

        if(!hasEnd) {
            result += '     <div class="state_item_mask">&nbsp;</div>';
        }

        result += '</div>';

        return result;
    }

    clearHighlights() {

    }

    public highlightConflictingState(conflict: any) {
        let item = this.visualisation.itemsData.get(conflict["context"]["id"]);

        if(item != null) {
            item["content"] = item["content"].split("trigger").join("").replace("state_item_wrapper", "state_item_wrapper conflict");
            this.items.update(item);
            this.parentDevice.setVisible(true);
        }
    }
}