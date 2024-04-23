const printDivider = () => {
    console.log('---------------------------------------------------\n');
};

function createCheckTestCase(functions) {
    const func = functions;

    return function ({ name, params, expect, checker_name }) {
        const result = func[name](...params);
        const checker = checker_name === undefined ? (e, r) => e === r : func[checker_name];

        console.log(`${name}: ${!checker(result, expect) ?
            `failed!\nExpected:\t${expect}\nReceived:\t${result}` :
            'passed'
            }\n`);

        printDivider();
    }
}

module.exports = {
    printDivider,
    createCheckTestCase
}