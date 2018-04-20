module.exports = {
    actions: {
        NOOP: () => {},
    },

    store: {
        prefs: {
            empty: {
                'user-access-token': '',
                'preferred-stream-quality': '',
                'favorite-streams': []
            },
            populated: {
                'user-access-token': 'example123abc',
                'preferred-stream-quality': '720p60',
                'favorite-streams': ['testname1']
            }
        },

        logs: {
            logLines: {
                two_items: {
                    testname1: [
                        'first log line',
                        'second log line',
                        '[TWITCHI]: status message',
                        'fourth log line',
                    ],

                    testname2: [
                        '1st log line',
                        '2nd log line',
                        '[TWITCHI]: status message',
                        '[TWITCHI]: 2nd status message',
                    ],
                }
            }
        },

        openStreams: {
            one_item: ['testname1'],
            two_items: ['testname1', 'testname2']
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
