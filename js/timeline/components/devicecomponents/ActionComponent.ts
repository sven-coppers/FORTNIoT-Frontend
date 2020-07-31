class ActionComponent extends EventComponent {
    private actionID: string;
    private ruleID: string;

    constructor(parentDevice: DeviceTimeline, parentElement: JQuery, ruleID: string, action: any) {
        super(parentDevice, parentElement, action["description"], null);
    }

    initHTML(parentElement: any, htmlPrefix: string, label: string, property: string, icon: string) {
        let html = "";
        html += '<div class="timeline_device_attribute" id="' + htmlPrefix + '_' + property + '">';
        html += '   <div class="timeline_label" id="' + htmlPrefix + '_' + property + '_label">';
        html += '       <div class="label_wrapper">';
        html += '           <h2 title="' + label + '"><label><input type="checkbox" class="rule_enabled" name="enabled" value="" id="">' + label + '</label></h2>';
        html += '       </div>';
        html += '   </div>';
        html += '   <div class="timeline_timeline" id="' + htmlPrefix + '_' + property + '_timeline"></div>';
        html += '   <div class="clearfix"></div>';
        html += '</div>';

        parentElement.append(html);
    }
}