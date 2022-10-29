const adminActions = require('./admin')

test('test returns input', () => {
    expect(adminActions.testFunction("Fart")).toBe("Fart");
});