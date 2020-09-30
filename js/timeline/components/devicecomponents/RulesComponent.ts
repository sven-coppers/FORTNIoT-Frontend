class RulesComponent extends EventComponent {
    rules: any;

    constructor(parentDevice: DeviceTimeline, parentElement: JQuery, rules: any) {
        super(parentDevice, parentElement, null, null);
        this.rules = rules;

        this.initRules()
    }

    initVisualisation(DOMElementID: string) {
        this.items = new vis.DataSet();
        this.groups = new vis.DataSet();

        this.options = this.getDefaultOptions();
        this.options["showMajorLabels"] = true;
        this.options["showMinorLabels"] = true;
        this.options["stack"] = true;

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

    redraw(ruleExecutions: any) {
        this.items.clear();

        for(let i = 0; i < ruleExecutions.length; i++) {
            let ruleExecution = ruleExecutions[i];
            let hasEffects: boolean = false;

            for(let actionExecutionIndex in ruleExecution["action_executions"]) {
                let actionExecution = ruleExecution["action_executions"][actionExecutionIndex];

                let actionEvent = {
                    id: actionExecution["action_execution_id"],
                    group: actionExecution["action_id"],
                    content: this.createCheckbox(actionExecution["action_execution_id"], actionExecution["snoozed"]),
                    start: ruleExecution["datetime"],
                    type: 'point'
                };
                this.items.add(actionEvent);
            }

            let RuleEvent = {
                id: ruleExecution["execution_id"],
                group: ruleExecution["id"],
                content: this.createHTML(ruleExecution["execution_id"]),
                start: ruleExecution["datetime"],
                type: 'point'
            };

            this.items.add(RuleEvent);
        }
    }

    itemClicked(properties) {
        if(properties["item"] != null) {
            let checkbox = $(properties.event.path[0]).closest(".checkbox");

            this.parentDevice.containerTimeline.actionExecutionChanged(properties["item"], properties["group"], checkbox.hasClass("checked"));
        }

        return false;
    }

    createCheckbox(actionExecutionID: string, snoozed: boolean) : string {
        let result : string = "";
        let classNames: string = "checkbox";

        if(!snoozed) {
            classNames += " checked";
        }

        if(Math.random() >= 0.5) {
            classNames += " conflict";
        }

        result += '<div class="' + classNames + '" id="' + actionExecutionID + '">&#10004</div>';

        return result;
    }

    redrawConflictsBackgrounds(conflicts: any) {
        for(let conflictIndex in conflicts) {
            let conflict = conflicts[conflictIndex];

            let conflictStart = new Date(conflict["conflicting_states"][0]["last_changed"]);
            let conflictEnd = new Date(conflict["conflicting_states"][0]["last_changed"]);

            for(let conflictingActionIndex in conflict["conflicting_states"]) {
                let conflictingAction = conflict["conflicting_states"][conflictingActionIndex];
                let conflictingActionDate = new Date(conflictingAction["last_changed"]);

                conflictStart = new Date(Math.min(conflictStart.getTime(), conflictingActionDate.getTime()));
                conflictEnd = new Date(Math.max(conflictEnd.getTime(), conflictingActionDate.getTime()));
            }

            let conflictEvent = {
                id: "conflict_" + conflictIndex,
                className: 'conflict',
                content: conflict["conflict_type"],
                start: conflictStart,
                end: conflictEnd,
                type: 'background'
            };

            this.items.add(conflictEvent);
        }

        $(".checkbox").on("click", function() {
            $(this).toggleClass("checked");
            $(this).removeClass("feedforward_checked");
            $(this).removeClass("feedforward_unchecked");
        })

        $(".checkbox").hover(function() {
            if($(this).hasClass("checked")) {
                $(this).addClass("feedforward_unchecked");
            } else {
                $(this).addClass("feedforward_checked");
            }
        }, function () {
            $(this).removeClass("feedforward_checked");
            $(this).removeClass("feedforward_unchecked");
        });
    }
}
