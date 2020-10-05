abstract class TimelineComponent {
    protected parentDevice: DeviceTimeline;

    protected visualisation: any; // Could be a timeline or a graph
    protected groups: any;
    protected items: any;
    protected options: any;
    protected DOMElementID: string;
    protected parentElement: JQuery;
    protected label: string;
    protected property: string;
    protected icon: string;
    protected visibleRange: any;

    protected constructor(parentDevice: DeviceTimeline, parentElement: JQuery, label: string, property: string, icon: string) {
        this.parentDevice = parentDevice;
        this.parentElement = parentElement;
        this.label = label;
        this.property = property;
        this.icon = icon;

        this.init();
    }

    /**
     * The HTML needs to be created before this function is called
     * @param DOMElementID
     */
    protected init() {
        this.initHTML(this.parentElement, this.parentDevice.getHTMLPrefix(), this.label, this.property, this.icon);
        this.initVisualisation(this.parentDevice.getHTMLPrefix() + '_' + this.property + '_timeline');
        this.initBehavior();
    }

    abstract getDefaultOptions();

    initHTML(parentElement: any, htmlPrefix: string, label: string, property: string, icon: string) {
        let shorthandLabel = label;

        let html = "";
        html += '<div class="timeline_device_attribute" id="' + htmlPrefix + '_' + property + '">';
        html += '   <div class="timeline_label" id="' + htmlPrefix + '_' + property + '_label">';

        if(icon != null) {
            html += '       <img title="' + label + '" src="img/devices/' + icon + '" />';
        }

        html += '       <div class="label_wrapper"><h2 title="' + label + '"> ' + shorthandLabel + '</h2></div>';
        html += '   </div>';
        html += '   <div class="timeline_timeline" id="' + htmlPrefix + '_' + property + '_timeline"></div>';
        html += '   <div class="clearfix"></div>';
        html += '</div>';

        parentElement.append(html);
    }

    abstract initVisualisation(DOMElementID: string);

    initBehavior() {
        let oThis = this;

        this.visualisation.on('rangechange', function(range) {
            if(range.byUser) {
                oThis.parentDevice.propagateReAlign(range);
            }
        });

        this.visualisation.on('click', function (properties) {
            oThis.itemClicked(properties);
        });
    }

    initDummyData(itemCount: number) {
        let startDate = new Date();
        var endDate = new Date(startDate.getTime() + 60 * 60 * 24 * 1000);
        var groupIds = this.groups.getIds();
        var types = ['box', 'point', 'range', 'background']
        for (var i = 0; i < itemCount; i++) {
            var rInt = this.randomIntFromInterval(1, 30);
            var start = new Date(startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime()));
            var end = new Date(startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime()));


            var randomGroupId = groupIds[this.randomIntFromInterval(1, groupIds.length)];
            var type = types[this.randomIntFromInterval(0, 3)]

            let item = {
                id: i,
                group: randomGroupId,
                content: 'item ' + i + ' ' + rInt,
                start: start,
                end: end,
                type: type
            };

            this.items.add(item);
        }
    }

    private randomIntFromInterval(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    abstract itemClicked(properties);

    reAlign(range) {
        this.visualisation.setOptions({start: range.start,  end: range.end});
        this.visibleRange = range;
    }

    drawCustomTime(date: Date) {
        this.visualisation.addCustomTime(date, "explainer");
    }

    clearCustomTime() {
        this.visualisation.removeCustomTime("explainer");
    }

    anyActionsVisible(actionContextID: string ): boolean {
        if(this.items != null) {
            return this.items.get(actionContextID) != null;
        }

        return false;
    }

    setWindow(range) {
        this.visualisation.setWindow({start: range.start,  end: range.end, duration: 750});
        this.visibleRange = range;
    }

    abstract redraw(deviceChanges: any, feedforward: boolean);

    abstract selectAction(identifier: string);

    abstract selectTrigger(identifier: string);

    abstract selectExecution(identifier: string);

    abstract clearHighlights();

    // Show that a future state will be in conflict
    abstract highlightConflictingState(conflictingState: any);
}