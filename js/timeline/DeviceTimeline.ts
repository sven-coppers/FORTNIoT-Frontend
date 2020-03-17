abstract class DeviceTimeline {
    public containerTimeline: Timeline;
    public deviceName: string;
    protected hasCustomTime: boolean;

    protected components: TimelineComponent[];
    protected visible: boolean;
    protected available: boolean;

    protected constructor(containerTimeline: Timeline, deviceName: string) {
        this.containerTimeline = containerTimeline;
        this.deviceName = deviceName;
        this.hasCustomTime = false;
        this.available = true;
        this.visible = true;

        this.initHTML();
        this.initBehavior();
    }

    initHTML() {
        let html = "";

        html += '<div class="timeline_device device">';
        html += '   <div class="timeline_device_main_attribute" id="' + this.getHTMLPrefix() + '_main_attribute">';
        html += '   </div>';
        html += '   <div class="timeline_device_attributes" id="' + this.getHTMLPrefix() + '_attributes">';
        html += '   </div>';
        html += '</div>';

        $(".timeline_wrapper").append(html);
    }

    getMainAttributeContainer() {
        return $("#" + this.getHTMLPrefix() + '_main_attribute');
    }

    getOtherAttributesContainer() {
        return $("#" + this.getHTMLPrefix() + '_attributes');
    }

    public initBehavior() {
        // $("#" + oThis.device.getHTMLID() + "_timeline_state_label").click(function() {
        //      $("#" + oThis.device.getHTMLID() + "_attributes").toggle();
        //  });
    }

    public redrawVisualisation(deviceChanges, feedforward: boolean) {
        for(let componentIndex in this.components) {
            this.components[componentIndex].redraw(deviceChanges, feedforward);
        }
    }

    public reAlign(range) {
        if(!this.available) return;

        for(let componentIndex in this.components) {
            this.components[componentIndex].reAlign(range);
        }
    }

    public propagateReAlign(range) {
        this.containerTimeline.reAlign(range, this.deviceName);
    }

    public anyActionsVisible(actionContextID: string ): boolean {
        for(let componentIndex in this.components) {
            if (this.components[componentIndex].anyActionsVisible(actionContextID)) return true;
        }

        return false;
    }

    public drawCustomTime(date: Date) {
        for(let componentIndex in this.components) {
            this.components[componentIndex].drawCustomTime(date);
        }
    }

    // Only if a timeline has the item, set the item for that timeline
    public clearCustomTime() {
        for(let componentIndex in this.components) {
            this.components[componentIndex].clearCustomTime();
        }
    }

    selectTrigger(stateContext: string) {
        for(let componentIndex in this.components) {
            this.components[componentIndex].selectTrigger(stateContext);
        }
    }

    selectAction(stateContext: string) {
        for(let componentIndex in this.components) {
            this.components[componentIndex].selectAction(stateContext);
        }
    }

    selectExecution(stateContext: string) {
        for(let componentIndex in this.components) {
            this.components[componentIndex].selectExecution(stateContext);
        }
    }

    getHTMLPrefix() {
        return this.deviceName.replace(".", "_");
    }

    setVisible(visible: boolean) {
        if(visible && this.available) {
            this.getMainAttributeContainer().parent().stop().slideDown(750);
            //this.getMainAttributeContainer().parent().removeClass("hidden");

           // this.getMainAttributeContainer().parent().removeClass("collapsed");
        } else {
            this.getMainAttributeContainer().parent().stop().slideUp(750);
           // this.getMainAttributeContainer().parent().addClass("collapsed");
        }
    }

    public setAvailable(available: boolean) {
        if(available) {
            this.getMainAttributeContainer().parent().show();
        } else {
            this.getMainAttributeContainer().parent().hide();
        }

        this.available = available;
    }

    clearHighlights() {
        for(let componentIndex in this.components) {
            this.components[componentIndex].clearHighlights();
        }
    }
}