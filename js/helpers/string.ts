function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function underscoresToCamelCase(input: string): string {
    let underscore: boolean = false;

    for(let i = 0; i < input.length; i++) {
        if(underscore) {
            input = input.substr(0, i - 1) + input.charAt(i).toUpperCase() + input.substr(i + 1, input.length - 1);
            underscore = false;
        }

        if(input.charAt(i) == "_") {
            underscore = true;
        }
    }

    return input;
}