export type InputConstructorArgsType = Array<{ key: string, type: string }>

export function extractConstructorArguments(contractCode: string): InputConstructorArgsType | null {
    // Regular expression to match constructor arguments
    const regex = /constructor\s*\(([^)]*)\)/;
    const matches = contractCode.match(regex);

    if (!matches || matches.length < 2) {
        console.error("Constructor arguments not found");
        return null;
    }

    const argumentString = matches[1].trim();

    // If there are no arguments, return null
    if (argumentString.length === 0) {
        return null;
    }

    // Split the argument string into individual arguments
    const argumentsArray = argumentString.split(',');

    // Extract keys and types
    const constructorArguments = argumentsArray.map((arg) => {
        // Use regex to capture the type and key
        const match = arg.trim().match(/(\S+)\s+(\S+)/);
        
        // Check if the match is valid
        if (!match || match.length !== 3) {
            console.error("Invalid constructor argument format:", arg);
            return { key: "", type: "" };
        }

        const [, type, key] = match;
        return { key, type };
    });

    return constructorArguments;
}