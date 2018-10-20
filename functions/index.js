'use strict';

const functions = require('firebase-functions');
const util = require('util');
const cors = require('cors')({
  origin: 'https://hashcib.com',
  optionsSuccessStatus: 200
});
const rp = require('request-promise');

function postToSlack(payload) {
  return rp({
    method: 'POST',
    uri: 'https://hooks.slack.com/services/' + functions.config().hash.slack,
    body: {
      username: "Hasch CIB Message Bot",
      icon_emoji: ":incoming_envelope:",
      attachments: [
        {
            fallback: "Hash CIB Feddback Form",
            "color": "#7B965A",
            title: "The following message was sent",
            fields: [
                {
                    title: "Name",
                    value: payload.name,
                    short: false
                },
                {
                  title: "Email",
                  value: payload.email,
                  short: false
                },
                {
                  title: "Question",
                  value: payload.question,
                  short: false
                }
            ],
            footer: "Hash CIB",
            footer_icon: "https://hashcib.com/assets/img/favicon_green.png",
            ts: Date.now() / 1000
        }
      ]
    },
    json: true,
  });
}

exports.feedback = functions.https.onRequest((req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).send('Method not allowed');
  }

  if(req.body === undefined) {
    return res.status(200).send('OK');
  }

  return cors(req, res, async () => {
    try {
      await postToSlack(req.body);
      return res.status(200).send('OK');
    } catch(error) {
      console.error(error);
      return res.status(500).send('Something went wrong while posting the message to Slack.');
    }
  });
});
