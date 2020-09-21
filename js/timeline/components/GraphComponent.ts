abstract class GraphComponent extends TimelineComponent {
    protected constructor(parentDevice: DeviceTimeline, parentElement: JQuery, label: string, property: string, icon: string) {
        super(parentDevice, parentElement, label, property, icon);

        this.visibleRange = this.getDefaultOptions();
    }

    getDefaultOptions() {
        return {
            min: new Date(new Date().getTime() - 1000 * 60 * 60 * 4.5), // 4 hours before
            max: new Date(new Date().getTime() + 1000 * 60 * 60 * 24.5), // 1 day after
            start: new Date(new Date().getTime() - 1000 * 60 * 60 * 4.5), // 1 hour before
            end: new Date(new Date().getTime() + 1000 * 60 * 60 * 24.5), // 5 hours ahead
            height: '100%',
            drawPoints: false,

            showMajorLabels: false,// No horizontal axis
            showMinorLabels: false, // No horizontal axis
            moment: function (date) {
                return vis.moment(date).utcOffset('+02:00');
            },
            defaultGroup: 'ungrouped'
        };
    }

    initVisualisation(DOMElementID: string) {
        this.items = new vis.DataSet();
        this.groups = new vis.DataSet();
        this.groups.add({ id: "normal", content: 'default', className: 'graph_normal', interpolation: {
                parametrization: 'centripetal'
            }});
        this.groups.add({ id: "feedforward", content: 'feedforward', className: 'graph_feedforward'});
        this.groups.add({ id: "causality", content: 'causality', className: 'graph_causality'});

        this.visualisation = new vis.Graph2d(document.getElementById(DOMElementID));
        this.visualisation.setOptions(this.getDefaultOptions());
        this.visualisation.setGroups(this.groups);
        this.visualisation.setItems(this.items);
    }

   /* initBehavior() {
        let oThis = this;

        this.visualisation.on('rangechange', function(range) {
            if(range.byUser) {
                oThis.parentDevice.propagateReAlign(range);
            }
        });
    } */

    itemClicked(properties) {
        let date = new Date(properties.time);

        let startDate = this.visibleRange.start;
        let endDate = this.visibleRange.end;
        let timelineWidth = this.parentDevice.getMainAttributeContainer().find(".vis-content").width();
        let timePerPixel = (endDate.getTime() - startDate.getTime()) / timelineWidth;

        let minX = 68;      let minOffset = 60;
        let maxX = 1600;    let maxOffset = 360;

        let screenSpaceOffset = minOffset + properties.x / (maxX - minX) * (maxOffset - minOffset); // pixels

        let timeOffset = timePerPixel * screenSpaceOffset;

        date.setTime(date.getTime() - timeOffset);
        let stateContextID = this.getClosestItemID(date);

        if(stateContextID != null) {
            this.parentDevice.containerTimeline.stateHighlighted(stateContextID);
        } else {
            this.parentDevice.containerTimeline.clearSelection(false);
        }
    }

    getClosestItemID(date: Date) {
        let items = this.items.get({
            fields: ['id', 'x', 'group']    // output the specified fields only
        });

        if(items.length == 0) return null;

        let closestDatapointID = items[0].id;
        let closestDatapointDeltaTime = Math.abs(items[0].x["_d"].getTime() - date.getTime());

        for(let i = 1; i < items.length; i++) {
            let itemDate = items[i].x["_d"];
            let itemDeltaTime = Math.abs(itemDate.getTime() - date.getTime());

            if(itemDeltaTime < closestDatapointDeltaTime) {
                closestDatapointDeltaTime = itemDeltaTime;
                closestDatapointID = items[i].id;
            }
        }

        return closestDatapointID;
    }

    redraw(deviceChanges: any) {
        this.items.clear();

        if(deviceChanges.length == 0) return;

        let thisValue = this.getValueFromJson(deviceChanges[0]);
        let thisValueFloat = parseFloat(thisValue);
        let thisTime = deviceChanges[0]["last_updated"];
        let thisID = deviceChanges[0]["context"]["id"];

        this.items.add({x: vis.moment(thisTime), y: thisValue, group: "normal", label: this.valueToLabel(thisValueFloat)});

        for(let i = 1; i < deviceChanges.length - 1; i++) {
            thisValue = this.getValueFromJson(deviceChanges[i]);
            thisTime = deviceChanges[i]["last_updated"];
            thisID = deviceChanges[i]["context"]["id"];

            let previousValue = parseFloat(this.getValueFromJson(deviceChanges[i - 1]));
            let nextValue = parseFloat(this.getValueFromJson(deviceChanges[i + 1]));
            thisValueFloat = parseFloat(thisValue);

            // IF local minimum or maximum, show label
            let isOptimum = (thisValueFloat < previousValue && thisValueFloat < nextValue) || (thisValueFloat > previousValue && thisValueFloat > nextValue);
            let isCutOff = (thisValueFloat == previousValue && thisValueFloat != nextValue) || (thisValueFloat != previousValue && thisValueFloat == nextValue);

            if(isOptimum || isCutOff) {
                this.items.add({x: vis.moment(thisTime), y: thisValue, group: "normal", id: thisID, label: this.valueToLabel(thisValueFloat)});
                continue;
            }

            this.items.add({x: vis.moment(thisTime), y: thisValue, group: "normal", id: thisID, label:  null /* {content: thisValueFloat.toFixed(1), xOffset: -5, yOffset: 18} */});
        }

        thisValue = this.getValueFromJson(deviceChanges[deviceChanges.length - 1]);
        thisTime = deviceChanges[deviceChanges.length - 1]["last_updated"];
        thisValueFloat = parseFloat(thisValue);

        this.items.add({x: vis.moment(thisTime), y: thisValue, group: "normal", label: this.valueToLabel(thisValueFloat)});

        if(Date.parse(thisTime) < new Date().getTime()) {
            this.items.add({x: vis.moment(new Date()), y: thisValue, group: "normal", label: this.valueToLabel(thisValueFloat)});
        }
    }

    valueToLabel(value) {
        return {content: value.toFixed(1), xOffset: -5, yOffset: 18};
    }

    selectAction(identifier: string) {
        let item = this.visualisation.itemsData.get(identifier);

        if(item != null) {
            this.items.add({x: item.x, y: item.y, group: "causality", label: {content: parseFloat(item.y).toFixed(1), xOffset: -5, yOffset: 18}});
           // item["content"] = item["content"].replace("state_item_wrapper", "state_item_wrapper action");
           // this.items.update(item);
            this.parentDevice.setVisible(true);
        }
    }

    selectTrigger(identifier: string) {
        let item = this.visualisation.itemsData.get(identifier);

        if(item != null) {
            this.items.add({x: item.x, y: item.y, group: "causality", label: {content: parseFloat(item.y).toFixed(1), xOffset: -5, yOffset: 18}});
           // item["content"] = item["content"].replace("state_item_wrapper", "state_item_wrapper trigger");
           // this.items.update(item);
            this.parentDevice.setVisible(true);
        }
    }

    selectExecution(identifier: string) {
        // TODO: Not supported for graphs??
    }

    getValueFromJson(deviceChange): string {
        if(this.property != null) {
            return deviceChange["attributes"][this.property];
        } else {
            return deviceChange["state"];
        }
    }

    clearHighlights() {
        let items =  this.visualisation.itemsData.get({
            filter: function (item) {
                return (item.group == "causality");
            }
        });

        this.visualisation.itemsData.remove(items);
    }

    public highlightConflictingState(conflictingState: any) {
        // TODO: draw in graphs
        console.log(conflictingState);
    }
}