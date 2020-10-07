class RulesComponent extends EventComponent {
    highlightedConflict: any;
    rulesClient: RuleClient;
    redrawing: boolean;

    constructor(parentDevice: DeviceTimeline, parentElement: JQuery, rules: any, rulesClient: RuleClient) {
        super(parentDevice, parentElement, null, null);

        this.highlightedConflict = null;
        this.rulesClient = rulesClient;
        this.redrawing = false;

        this.initRules(rules)
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

    initRules(rules: any) {
        for(let ruleID in rules) {
            let rule = rules[ruleID];

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

    /** Draw the action executions
     *
     * @param ruleExecutions
     */
    redraw(ruleExecutions: any) {
        this.items.clear();

        for(let i = 0; i < ruleExecutions.length; i++) {
            let ruleExecution = ruleExecutions[i];

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


        // The tiny timeout makes sure mouseenter is not triggered when the user is hovering a checkbox that is redrawn
        setTimeout(function() {
            $(".checkbox").on("click", function () {
                $(this).toggleClass("checked");
                $(this).removeClass("feedforward_checked");
                $(this).removeClass("feedforward_unchecked");
            })

            $(".checkbox").mouseenter(function (event) {
                if ($(this).hasClass("checked")) {
                    $(this).addClass("feedforward_unchecked");
                } else {
                    $(this).addClass("feedforward_checked");
                }
            });

            $(".checkbox").mouseleave(function () {
                $(this).removeClass("feedforward_checked");
                $(this).removeClass("feedforward_unchecked");
            });
        }, 10);
    }

    itemClicked(properties) {
        if(properties["item"] != null) {
            // If checkbox
            let checkbox = $(properties.event.path[0]).closest(".checkbox");

            this.parentDevice.containerTimeline.actionExecutionChanged(properties["item"], properties["group"], checkbox.hasClass("checked"));
          //  this.parentDevice.containerTimeline.clearSelection(false);
        } else if(properties["what"] === "background" && this.highlightedConflict != null) {
            let conflictRange = this.findConflictRange(this.highlightedConflict);

            //if(properties.time.getTime() > conflictRange.start && properties.time.getTime() < conflictRange.end) {

            if(properties.event.target.closest(".vis-item.vis-background") != null) {
                // The conflict

                let conflictLength = conflictRange.end.getTime() - conflictRange.start.getTime();

                // 25% aan iedere kant
                let newWindow = {
                    start: new Date(conflictRange.start.getTime() - conflictLength / 2),
                    end: new Date(conflictRange.end.getTime() + conflictLength / 2)
                }

                this.parentDevice.containerTimeline.setWindow(newWindow);
            } else {
                this.parentDevice.containerTimeline.clearSelection(false);
            }
        }

        return false;
    }

    createCheckbox(actionExecutionID: string, snoozed: boolean) : string {
        let result : string = "";
        let classNames: string = "checkbox";

        if(!snoozed) {
            classNames += " checked";
        }

        result += '<div class="' + classNames + '" id="' + actionExecutionID + '">&#10004</div>';

        return result;
    }

    highlightConflict(conflict: any) {
        this.clearConflict();

        for(let conflictingStateIndex in conflict["conflicting_states"]) {
            // find the responsible action execution for this state
            let conflictingState = conflict["conflicting_states"][conflictingStateIndex];
            let conflictingAction = this.rulesClient.getActionExecutionByResultingContextID(conflictingState["context"]["id"]);

            if(conflictingAction != null) {
                $("#" + conflictingAction["action_execution_id"]).addClass("conflict");
            }
        }

        let conflictRange = this.findConflictRange(conflict);

        let conflictEvent = {
            id: "conflict",
            className: 'conflict',
            content: conflict["conflict_type"],
            start: conflictRange.start,
            end: conflictRange.end,
            type: 'background'
        };

        this.items.add(conflictEvent);
        this.highlightedConflict = conflict;
    }

    findConflictRange(conflict: any) {
        let conflictStart = new Date(conflict["conflicting_states"][0]["last_changed"]);
        let conflictEnd = new Date(conflict["conflicting_states"][0]["last_changed"]);

        for(let conflictingActionIndex in conflict["conflicting_states"]) {
            let conflictingAction = conflict["conflicting_states"][conflictingActionIndex];
            let conflictingActionDate = new Date(conflictingAction["last_changed"]);

            conflictStart = new Date(Math.min(conflictStart.getTime(), conflictingActionDate.getTime()));
            conflictEnd = new Date(Math.max(conflictEnd.getTime(), conflictingActionDate.getTime()));

            $("#" + conflictingAction["action_execution_id"]).addClass("conflict");
        }

        if(conflictStart.getTime() === conflictEnd.getTime()) {
            conflictStart = new Date(conflictStart.getTime() - 30000);
            conflictEnd = new Date(conflictEnd.getTime() + 30000);
        }

        return {start: conflictStart, end: conflictEnd};
    }

    highlightActionExecution(actionExecutionID: string) {
        $("#" + actionExecutionID).addClass("highlighted");
    }

    clearConflict() {
        this.items.remove("conflict");
        $(".checkbox.conflict").removeClass("conflict");
        $(".checkbox.highlighted").removeClass("highlighted");
        this.highlightedConflict = null;
    }
}
