const ElFinder = el => ({
    // carry over existing properties
    ...el,

    child: {
        // return ElFinder instance of child at index
        atIndex: index =>
            ElFinder(el.children[index]),

        // child at index (h call object)
        // does not wrap with ElFinder
        atIndexRaw: index => el.children[index]
    },

    firstChild: {
        // return ElFinder instance of first child
        byIndex: () => ElFinder(el.children[0]),

        // first child element (h call object)
        // does not wrap with ElFinder
        raw: () => el.children[0],

        // return ElFinder instance of first child with matching ID attribute
        byId: id =>
            ElFinder(el.children.find(el => el.attributes.id === id)),

        // return ElFinder instance of first child with matching element type (nodeName)
        byType: type =>
            ElFinder(el.children.find(el => el.nodeName === type)),

        // return ElFinder instance of first child with matching className attribute
        byClass: className =>
            ElFinder(el.children.find(el => el.attributes.className
                                    ? el.attributes.className.includes(className)
                                    : false)),
    },

    allChildren: {
        // return array of ElFinder instances for each child matching element type (nodeName)
        ofType: type => 
            el.children.filter(el => el.nodeName === type)
            .map(el => ElFinder(el)),

        // return array of ElFinder instances for each child with matching className attribute
        withClass: className =>
            el.children.filter(el => el.attributes.className
                            ? el.attributes.className.includes(className)
                            : false)
            .map(el => ElFinder(el)),
    }

    // return ElFinder instance of first child with matching ID attribute
    // firstChildWithId: id =>
    //     ElFinder(el.children.find(el => el.attributes.id === id)),

    // return ElFinder instance of first child with matching element type (nodeName)
    // firstChildOfType: type =>
    //     ElFinder(el.children.find(el => el.nodeName === type)),

    // return array of ElFinder instances for each child matching element type (nodeName)
    // childrenOfType: type => 
    //     el.children.filter(el => el.nodeName === type)
    //     .map(el => ElFinder(el)),

    // return ElFinder instance of first child with matching className attribute
    // firstChildWithClass: className =>
    //     ElFinder(el.children.find(el => el.attributes.className
    //                               ? el.attributes.className.includes(className)
    //                               : false)),

    // // return array of ElFinder instances for each child with matching className attribute
    // childrenWithClass: className =>
    //     el.children.filter(el => el.attributes.className
    //                        ? el.attributes.className.includes(className)
    //                        : false)
    //     .map(el => ElFinder(el)),

    // return ElFinder instance of child at index
    // childAtIndex: index =>
    //     ElFinder(el.children[index]),

    // return ElFinder instance of first child
    // firstChild: () => ElFinder(el.children[0]),

    // Raw functions
    // NOTE: These do NOT return an ElFinder object, just a hyperscript element.
    // useful for getting text from elements, as ElFinder objects created from text
    // provide each letter of the string as a separate object property.

    // child at index (h call object)
    // childAtIndexRaw: index => el.children[index],

    // first child element (h call object)
    // firstChildRaw: () => el.children[0],
})

export default ElFinder
