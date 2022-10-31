const adminActions = require('./adminActions')

test('test returns input', () => {
    expect(adminActions.testFunction("Fart")).toBe("Fart");
});