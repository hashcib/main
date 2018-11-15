'use strict';

const functions = require('firebase-functions');
const rp = require('request-promise');
const mailgun = require('mailgun-js')({
  apiKey: functions.config().hash.mailgun,
  domain: "mg.hashcib.com"
});
const sanitizer = require("sanitizer");

function getFeedbackSlackPayload(payload) {
  return {
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
  };
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

function generateReportRequestLink(payload) { 
  //return "#";
  return "http://" + functions.config().hash.tonurl +
    "/ton" +
    "?secret=" + functions.config().hash.tonsecret +
    "&name=" + encodeURI(payload.name) +
    "&surname=" + encodeURI(payload.surname) +
    "&email=" + encodeURI(payload.email) +
    "&company=" + encodeURI(payload.company);
}

function getMailRequestPayload(payload) {
  return {
    from: 'HashCIB Message Bot <info@hashcib.com>',
    // to: process.env.GCLOUD_PROJECT === "stage" ? "d.naumov@qiwi.tech" : "research@hashcib.com",
    to: "research@hashcib.com",
    subject: 'Новый завпрос на TON Research',
    html:
      "<html><body><p>Привет,</p><p>Новый запрос:</p>" +
      "<ul><li><b>Имя:</b> " + payload.name + " " + payload.surname +
      "</li><li><b>Email:</b> " + payload.email +
      "</li><li><b>Компания:</b> " + payload.company +
      "</li></ul>" +
      "<p><a href=\"" + generateReportRequestLink(payload) + "\">Отправить отчёт этому пользователю</a></p>" +
      "<p>/HashCIB Message Bot</p></body></html>"
  }
}

function getReCAPTCHAVerifyPayload(token) {
  return {
    method: 'POST',
    uri: 'https://www.google.com/recaptcha/api/siteverify?secret=' +
      functions.config().hash.gsecret +
      '&response=' + token,
    json: true,
  };
}

function sanitizeTONPayload(payload)  { 
  return {
    name: sanitizer.sanitize(payload.name),
    surname: sanitizer.sanitize(payload.surname),
    email: sanitizer.sanitize(payload.email),
    company: sanitizer.sanitize(payload.company)
  }
}

function sanitizeFeedbackPayload(payload)  { 
  return {
    name: sanitizer.sanitize(payload.name),
    email: sanitizer.sanitize(payload.email),
    question: sanitizer.sanitize(payload.question)
  }
}

exports.feedback = functions.https.onRequest((req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).send('Method not allowed');
  }

  if (req.body === undefined || req.body.gtoken === undefined) {
    return res.status(415).send('No payload we can work with :(');
  }

  return rp(getReCAPTCHAVerifyPayload(req.body.gtoken), async (gerr, _, gbody) => {
    if (!gbody.success) {
      console.error(gerr);
      return res.status(415).send('You\'re a robot');
    }

    try {
      var payload = sanitizeFeedbackPayload(req.body);
      await rp(getFeedbackSlackPayload(payload));
      return res.status(200).send('OK');
    } catch (error) {
      console.error(error);
      return res.status(500).send('Something went wrong while posting the message to Slack.');
    }
  });
});

exports.ton = functions.https.onRequest((req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).send('Method not allowed');
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
      var payload = sanitizeTONPayload(req.body);
      await rp(getTonSlackPayload(payload));
      mailgun.messages().send(getMailRequestPayload(payload), (error, body) => {
        console.log(body);
      });
      return res.status(200).send('OK');
    } catch (error) {
      console.error(error);
      return res.status(500).send('Something went wrong while posting the message to Slack.');
    }
  });
});