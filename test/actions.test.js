import actions from 'actions/actions'

test('setState replaces entire state object', () => {
    const testData1 = {
        abc: 'def',
        childObj: {
            childObjKey: [ 'one', 'two' ]
        }
    }

    const testData2 = { abc: 'def' }

    expect(actions.setState(testData1))
        .toEqual(testData1)

    expect(actions.setState(testData2))
        .toEqual(testData2)
})

