# CLAUDE.md

## Project Overview

A simple Czech-language web page with an embedded chat widget and a user feedback button.

## Structure

- `index.html` — Main page with chat widget and feedback modal
- `feedback.test.js` — Jest tests for the feedback button
- `package.json` — Node.js dev dependencies and test configuration

## Running Tests

```bash
npm install
npm test
```

Tests use [Jest](https://jestjs.io/) with `jsdom` to simulate browser DOM behavior.

## Development Notes

- The chat widget is loaded from `https://app.chatbuilders.cz/webchat/plugin.js`
- The feedback button opens a modal where users can submit comments
- All UI is in Czech (`lang="cs"`)
