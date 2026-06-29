const { google } = require('googleapis');

exports.getLogsHandler = async (event) => {
    console.log('Fetching recent etchings...');

    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    };

    try {
        const oauth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET
        );

        oauth2Client.setCredentials({
            refresh_token: process.env.GOOGLE_REFRESH_TOKEN
        });

        const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
        const calendarId = process.env.GOOGLE_CALENDAR_ID || 'primary';

        // 3. Query the last 15 events
        const response = await calendar.events.list({
            calendarId: calendarId,
            maxResults: 15,
            singleEvents: true,
            orderBy: 'startTime',
            timeMin: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        });

        const events = response.data.items || [];

        const formattedLogs = events
            .map((item) => ({
                id: item.id,
                title: item.summary || 'UNTITLED ETCHING',
                summary: item.description || 'NO AD-LIBS RECORDED. UNGA.',
                link: item.htmlLink || 'https://calendar.google.com',
                startTime: item.start?.dateTime || item.start?.date
            }))
            .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());

        return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify(formattedLogs),
        };

    } catch (error) {
        console.error('Error fetching calendar logs:', error);
        return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({ error: 'Failed to retrieve stone logs', details: error.message }),
        };
    }
};