class RulesComponent extends EventComponent {
    highlightedConflict: any;
    futureClient: FutureClient;
    redrawing: boolean;

    constructor(mainController: IoTController, parentDevice: DeviceTimeline, parentElement: JQuery, rules: any, futureClient: FutureClient) {
        super(mainController, parentDevice, parentElement, null, null);

        this.highlightedConflict = null;
        this.futureClient = futureClient;
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
    redraw(ruleExecutions: any, feedforward: boolean) {
        if(feedforward) {
            this.removeFeedforwardBehavior();
            this.addFeedforward(ruleExecutions);
            this.addFeedforwardBehavior();
        } else {
            this.items.clear();
            this.drawExecutions(ruleExecutions);
        }
    }

    drawExecutions(ruleExecutions) {
        for(let i = 0; i < ruleExecutions.length; i++) {
            let ruleExecution = ruleExecutions[i];

            for(let actionExecution of ruleExecution["action_executions"]) {
                this.items.add(this.createActionExecutionItem(actionExecution, ruleExecution));
            }

          /*  let RuleEvent = {
                id: ruleExecution["execution_id"],
                group: ruleExecution["rule_id"],
                content: this.createHTML(ruleExecution["execution_id"]),
                start: ruleExecution["datetime"],
                type: 'point'
            }; */

            //  this.items.add(RuleEvent);
        }

        let oThis = this;

        setTimeout(function() {
            $(".action_execution").mouseenter(function (event) {

                oThis.mainController.previewActionExecutionChange($(this).attr("id"), !$(this).hasClass("checked"));
            });
        }, 10);


        this.addFeedforwardBehavior();
    }

    addFeedforwardBehavior() {
        let oThis = this;

        // The tiny timeout makes sure mouseenter is not triggered when the user is hovering a checkbox that is redrawn
        setTimeout(function() {
            $(".action_execution").mouseleave(function () {
                oThis.mainController.cancelPreviewActionExecutionChange();
            });
        }, 10);
    }

    removeFeedforwardBehavior() {
        $(".action_execution").unbind();
    }

    addFeedforward(mergedRuleExecutions : any []) {
        for(let mergedRuleExecution of mergedRuleExecutions) {
            for(let actionExecution of mergedRuleExecution["action_executions"]) {
                //console.log("action_id: " + actionExecution["action_id"] + ", action_execution_id: " + actionExecution["action_execution_id"] + ", future: " + actionExecution["future"]);

                if(actionExecution["future"] == "new") {
                    this.items.add(this.createActionExecutionItem(actionExecution, mergedRuleExecution));
                }

                $("#" + actionExecution["action_execution_id"]).addClass(actionExecution["future"]);
            }
        }
    }

    itemClicked(properties) {
        if(properties["item"] != null && properties["item"].indexOf('action_execution') !== -1) {
            let checkbox = $("#" + properties["item"]);

           // if(checkbox.hasClass("highlighted")) {
                this.mainController.actionExecutionChanged(properties["item"], properties["group"], !checkbox.hasClass("checked"));
          /*  } else {
                this.mainController.selectActionExecution(properties["item"]);
            } */
        } else if(properties["what"] === "background" && this.highlightedConflict != null) {
            let conflictRange = this.findConflictRange(this.highlightedConflict);

            if(properties.event.target.closest(".vis-item.vis-background") != null) {
                // The conflict

                let conflictLength = conflictRange.end.getTime() - conflictRange.start.getTime();

                // 25% aan iedere kant
                let newWindow = {
                    start: new Date(conflictRange.start.getTime() - conflictLength / 2),
                    end: new Date(conflictRange.end.getTime() + conflictLength / 2)
                }

                this.mainController.setWindow(newWindow);
            } else {
                this.mainController.clearSelection(false);
            }
        } else {
            console.log("TODO DEFINE BEHAVIOR")
            this.mainController.clearSelection(false);
            this.mainController.cancelPreviewActionExecutionChange();
        }

        return false;
    }

    createActionExecutionItem(actionExecution: any, ruleExecution) {
        return {
            id: actionExecution["action_execution_id"],
            group: actionExecution["action_id"],
            content: this.createActionExecutionVisualisation(actionExecution["action_execution_id"], actionExecution["snoozed"], actionExecution["has_effects"]),
            start: ruleExecution["datetime"],
            type: 'point'
        };
    }

    createActionExecutionVisualisation(actionExecutionID: string, snoozed: boolean, hasEffects: boolean) {
        let result : string = "";
        let classNames: string = "action_execution";
        let title = "This action is snoozed by the user";

        if(!snoozed) {
            classNames += " checked";

            if(hasEffects) {
                classNames += " effective";
                title = "This action has one or more effects";
                title = ""
            } else {
                classNames += " ineffective";
                title = "This action has no effects";
            }
        }

        result += '<div class="' + classNames + '" id="' + actionExecutionID + '" title="' + title + '">&#10004</div>';

        return result;
    }

    highlightConflict(conflict: any) {
        this.clearConflict();

        for(let conflictingStateIndex in conflict["conflicting_states"]) {
            // find the responsible action execution for this state
            let conflictingState = conflict["conflicting_states"][conflictingStateIndex];
            let conflictingAction = this.futureClient.getActionExecutionByResultingContextID(conflictingState["context"]["id"], null);

            if(conflictingAction != null) {
                $("#" + conflictingAction["action_execution_id"]).addClass("conflict_related");

                let conflictingRuleExecution = this.futureClient.getRuleExecutionByActionExecutionID(conflictingAction["action_execution_id"]);

                if(conflictingRuleExecution != null) {
                    $("#" + conflictingRuleExecution["execution_id"]).addClass("conflict");
                }
            }
        }

     //   $("#" + conflict["execution_id"]).addClass("conflict");

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
        $(".event_item.conflict").removeClass("conflict");
        $(".checkbox.conflict").removeClass("conflict");
        $(".checkbox.highlighted").removeClass("highlighted");
        this.highlightedConflict = null;
    }
}
