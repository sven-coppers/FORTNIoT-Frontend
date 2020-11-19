class StateComponent extends TimelineComponent {
    constructor(mainController: IoTController, parentDevice: DeviceTimeline, parentElement: JQuery, label: string, property: string, icon: string) {
        super(mainController, parentDevice, parentElement, label, property, icon);
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
        let clickedElement = $(properties.event.path[0]);
        let stateContextID = clickedElement.closest(".state_item_wrapper").find(".state_option").first().attr("id");

        // If a sub state was selected
        if(clickedElement.hasClass("state_option")) {
            stateContextID = clickedElement.attr("id");
        }

        if(stateContextID != null) {
            this.mainController.selectState(stateContextID);
        } else {
            this.mainController.clearSelection(true);
        }
    }

    redraw(deviceChanges: any, feedforward: boolean) {
        if(!feedforward) {
            for(let deviceChange of deviceChanges) {
                deviceChange["future"] = "unchanged";
            }
        }

        if(deviceChanges[0]["entity_id"] == "light.living_spots") {
            for(let deviceChange of deviceChanges) {
             //   console.log((feedforward? "feedforward: " : "normal: ") + deviceChange["entity_id"] + " - " + deviceChange["state"] + " (" + deviceChange["future"] + ")");
            }
        }

        let config: ConfigClient = this.mainController.getConfigClient();

        this.items.clear();
        if(deviceChanges.length == 0) return;

        let endDate: Date = new Date();
        endDate.setTime(new Date().getTime() + (config.getPredictionWindow() * 60 * 1000)); // Convert minutes to milliseconds

        this.redrawWithPredictions(deviceChanges, feedforward, endDate);
    }

    private redrawWithPredictions(deviceChanges: any, feedforward: boolean, predictionEnd: Date) {
        let jsonObjects = [];
        let similarIndex = 0;

        for(let startIndex = 0; startIndex < deviceChanges.length ; ) {
            jsonObjects.push(deviceChanges[startIndex]);

            // Find states that happen at exactly the same time
            for(similarIndex = startIndex + 1; similarIndex < deviceChanges.length; similarIndex++) {
                if(deviceChanges[startIndex]["last_changed"] == deviceChanges[similarIndex]["last_changed"]) {
                    jsonObjects.push(deviceChanges[similarIndex]);
                } else {
                    break;
                }
            }

            let found = false;

            for(let endIndex = similarIndex; endIndex < deviceChanges.length; endIndex++) {
                let laterStateInConflict = endIndex + 1 < deviceChanges.length && deviceChanges[endIndex]["last_changed"] == deviceChanges[endIndex + 1]["last_changed"];

                if(jsonObjects.length > 1 || laterStateInConflict || this.areDifferent(deviceChanges[startIndex], deviceChanges[endIndex])) {
                    this.items.add(this.mergedJsonToItem(jsonObjects, deviceChanges[endIndex]["last_changed"]));
                    startIndex = endIndex;
                    found = true;
                    jsonObjects = [];
                    break;
                }
            }

            if(!found) { // THIS WAS THE LAST ELEMENT
                this.items.add(this.mergedJsonToItem(jsonObjects, predictionEnd));
                jsonObjects = [];
                break;
            }
        }
    }

    selectExecution(identifier: string) {
        // Not supported for states
    }

    areDifferent(firstJson, secondJson): boolean {
        return firstJson["state"] !== secondJson["state"];// || firstJson["future"] !== secondJson["future"];
    }

    mergedJsonToItem(jsonObjects, endTime): any {
        let ids = [];
        let labels = [];
        let futures = [];

        for(let index in jsonObjects) {
            let jsonObject = jsonObjects[index];

            ids.push(jsonObject["context"]["id"]);
            labels.push(this.jsonToLabel(jsonObject));
            futures.push(jsonObject["future"]);
        }

        let item = {
            id: jsonObjects[0]["context"]["id"],
            group: 1,
            start: jsonObjects[0]["last_changed"]
        };

        if(endTime != null) {
            item["end"] = endTime;
            item["type"] = 'range';
            item["content"] = this.createMergedHTML(ids, labels, futures,true);
        } else {
            item["type"] = 'point';
            item["content"] = this.createMergedHTML(ids, labels, futures,false);
        }

        return item;
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
            item["content"] = this.createHTML(id,  '<span class="state_option" id="' + id + '">' + label + '</span>', true, json["future"]);
        } else {
            item["type"] = 'point';
            item["content"] = this.createHTML(id,  '<span class="state_option" id="' + id + '">' + label + '</span>', false, json["future"]);
        }

        return item;
    }

    jsonToLabel(json) {
        return capitalizeFirstLetter(json["state"].replace("_", " "));
    }

    createMergedHTML(ids: string [], contents: string [], futures: string [], hasEnd: boolean): string {
        let mergedIds = ids[0];
        let mergedContents = '<span class="state_option ' +  futures[0] + '" id="' + ids[0] + '">' + contents[0] + '</span>';
        let hasNewOptions = false;
        let hasDeprecatedOptions = false;

        for(let i = 1; i < ids.length; ++i) {
            mergedIds += " " + ids[i];
            mergedContents += ' / <span class="state_option ' +  futures[i] + '" id="' + ids[i] + '">' + contents[i] + '</span>';
        }

        for(let i = 0; i < ids.length; ++i) {
            if(futures[i] == "new") hasNewOptions = true;
            if(futures[i] == "deprecated") hasDeprecatedOptions = true;
        }

        let future = "unchanged";
        if(hasDeprecatedOptions) future = "deprecated";
        if(hasNewOptions) future = "new"; // krijgt voorrang

        return this.createHTML(mergedIds, mergedContents, hasEnd, future);
    }

    createHTML(id: string, content: string, hasEnd: boolean, future: string) : string {
        let additionalClasses: string = "";

        if(!hasEnd) {
            additionalClasses += " unfinished";
        }

        if(typeof future !== "undefined") {
            additionalClasses += " " + future.toLowerCase();
        }

        let result = '<div class="state_item_wrapper' + additionalClasses + '">';
        result += '    <div class="state_item_icon"><img src="img/warning.png" title="This state will be involved in a conflict" /></div>';
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

    selectAction(identifier: string) {
        // Do nothing
    }

    selectTrigger(identifier: string) {
        // Do nothing
    }
}