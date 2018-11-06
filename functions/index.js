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
      attachments: [{
        fallback: "Hash CIB Feddback Form",
        "color": "#7B965A",
        title: "The following message was sent",
        fields: [{
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
      }]
    },
    json: true,
  });
}

function getTonSlackPayload(payload) {
  return {
    method: 'POST',
    uri: 'https://hooks.slack.com/services/' + functions.config().hash.slackton,
    body: {
      username: "Hasch CIB Message Bot",
      icon_emoji: ":incoming_envelope:",
      attachments: [{
        fallback: "Hash CIB Feddback Form",
        "color": "#7B965A",
        title: "The following TON Research request was sent",
        fields: [{
            title: "Name",
            value: payload.name + " " + payload.surname,
            short: false
          },
          {
            title: "Email",
            value: payload.email,
            short: false
          },
          {
            title: "Company",
            value: payload.company,
            short: false
          }
        ],
        footer: "Hash CIB",
        footer_icon: "https://hashcib.com/assets/img/favicon_green.png",
        ts: Date.now() / 1000
      }]
    },
    json: true,
  };
}

function getMailRequestPayload(payload) {
  if (payload.email !== undefined) {
    return {
      from: 'HashCIB Message Bot <info@hashcib.com>',
      to: "kalambet@qiwi.tech, i.khrulev@qiwi.tech",
      subject: 'Новый завпрос на TON Research',
      html: "<html><body><p>Привет,</p><p>Новый запрос:</p><ul><li><b>Имя:</b> " + payload.name + " " + paylaod.surname + "</li><li><b>Email:</b> " + payload.email + "</li><li><b>Компания:</b> " + payload.company + "</li></ul><p>/HashCIB Message Bot</p></body></html>"
    }
  }
  return undefined;
}

exports.feedback = functions.https.onRequest((req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).send('Method not allowed');
  }

  if (req.body === undefined) {
    return res.status(200).send('OK');
  }

  return cors(req, res, async () => {
    try {
      await postToSlack(req.body);
      return res.status(200).send('OK');
    } catch (error) {
      console.error(error);
      return res.status(500).send('Something went wrong while posting the message to Slack.');
    }
  });
});

function getReCAPTCHAVerifyPayload(token) {
  return {
    method: 'POST',
    uri: 'https://www.google.com/recaptcha/api/siteverify?secret=' + functions.config().hash.gsecret + '&response=' + token,
    json: true,
  };
}

exports.ton = functions.https.onRequest((req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).send('Method not allowed');
  }

  if (req.body === undefined) {
    return res.status(200).send('OK');
  }

  if (req.body === undefined || req.body.gtoken === undefined) {
    return res.status(415).send('No payload we can work with :(');
  }

  return rp(getReCAPTCHAVerifyPayload(req.body.gtoken), async (gerr, gres, gbody) => {
    if (!gbody.success) {
      console.error(gerr);
      return res.status(415).send('You\'re a robot');
    }

    try {
      await rp(getTonSlackPayload(req.body));
      mailgun.messages().send(getMailRequestPayload(req.body), (error, body) => {
        console.log(body);
      });
      return res.status(200).send('OK');
    } catch (error) {
      console.error(error);
      return res.status(500).send('Something went wrong while posting the message to Slack.');
    }
  });
});