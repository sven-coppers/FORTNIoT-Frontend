class RulesComponent extends StateComponent {
    rules: any;

    constructor(parentDevice: DeviceTimeline, parentElement: JQuery, rules: any) {
        super(parentDevice, parentElement, null, null, null);
        this.rules = rules;

        this.initRules()
    }

    initVisualisation(DOMElementID: string) {
        this.items = new vis.DataSet();
        this.groups = new vis.DataSet();

        this.options = this.getDefaultOptions();
        this.options["showMajorLabels"] = true;
        this.options["showMinorLabels"] = true;

        this.visualisation = new vis.Timeline(document.getElementById(DOMElementID));
        this.visualisation.setOptions(this.options);
        this.visualisation.setGroups(this.groups);
        this.visualisation.setItems(this.items);
    }

    initRules() {
        for(let ruleID in this.rules) {
            let rule = this.rules[ruleID];

            if(!rule["available"]) continue;
            if(ruleID.indexOf("implicit_behavior") == 0) continue;

            let ruleGroups = [];
            let actionIDs = [];

            for(let actionIndex in rule["actions"]) {
                let action = rule["actions"][actionIndex];

                ruleGroups.push({
                    id: action["id"],
                    content: action["description"],
                    treeLevel: 2
                });

                actionIDs.push(action["id"]);
            }

            // Push the trigger
            ruleGroups.push({
                id: ruleID,
                title: "IF " + rule["description"],
                content: "<img src=\"img/devices/rule.png\" />IF " + rule["description"],
                treeLevel: 1,
                nestedGroups: actionIDs /*,
                showNested: false */
            })

            this.groups.add(ruleGroups);
        }
    }

    redraw(ruleExecutions: any, feedforward) {
        let startDay = vis.moment().startOf("month").startOf("week").isoWeekday(1);

        var now = vis.moment().minutes(0).seconds(0).milliseconds(0);
        var itemCount = 60;

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

    randomIntFromInterval(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    reAlign(range) {
        super.reAlign(range);
        this.visualisation.redraw();
        //this.setItems();
    }

    itemClicked(properties) {
        return false;
    }
}
