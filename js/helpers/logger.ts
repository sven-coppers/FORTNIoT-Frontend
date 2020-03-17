var LOG_SAVE_URL = "api/save.php";

class Logger {
    private cache: string[];
    private reached: boolean;

    constructor() {
        this.cache = [];
        this.reached = false;
    }

    log(message: string) {
        message = new Date().toISOString() + " - " + message;

        console.log(message);
        this.cache.push(message);
    }

    taskReached () {
        this.log("TASK REACHED");
        this.reached = true;
    }

    isTaskReached () {
        return this.reached;
    }

    save(fileName, doneCallback, failCallback) {
        if(this.cache.length > 0) {
            var thisObject = this;
            var message = this.combineLogMessages();

            var data = {"file": fileName, "log": message};

            // @ts-ignore
            $.post(LOG_SAVE_URL, JSON.stringify(data))
                .done(function(response) {
                    // Logging succeded
                    thisObject.cache = [];
                    doneCallback(response);
                })
                .fail(function(response) {
                    failCallback(response);
                });
        } else {
            failCallback("No interaction detected.");
        }
    }

    combineLogMessages() {
        let result = "";

        for(let i = 0; i < this.cache.length; i++) {
            result += this.cache[i] + "\n";
        }

        return result;
    }
}