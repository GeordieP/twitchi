module.exports = {
    actions: {
        NOOP: () => {},
    },

    store: {
        prefs: {
            empty: {}
        },

        streams: {
            empty: [],

            one_item: [{
                game: 'Test Game 1',
                viewers: 302110,
                preview: { medium: '' },
                channel: {
                    status: 'Test Title 1',
                    display_name: 'TestName1',
                    name: 'testname1',
                    url: 'https://test-1.url'
                }
            }],

            two_items: [
                {
                    game: 'Test Game 1',
                    viewers: 256,
                    preview: { medium: '' },
                    channel: {
                        status: 'Test Title 1',
                        display_name: 'TestName1',
                        name: 'testname1',
                        url: 'https://test-1.url'
                    }
                },
                {
                    game: 'Test Game 2',
                    viewers: 13,
                    preview: { medium: '' },
                    channel: {
                        status: 'Test Title 2',
                        display_name: 'TestName2',
                        name: 'testname2',
                        url: 'https://test-2.url'
                    }
                }
            ],
        }
    }
}
