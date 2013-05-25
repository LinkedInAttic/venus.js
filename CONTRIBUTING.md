# Contributing to Venus

1. Fork Venus[^1]
2. Update the Issue Tracker
  - if there's already an open ticket, feel free to comment on it or ask any follow up questions
  - if there isn't a ticket, create one and let us know what you plan to do
3. Write some code
4. Update or create test cases for your changes
5. Make sure all tests are passing `npm test`
6. Commit and push your changes (referencing any related issues in the comment)
7. Finally, create a [Pull Request](https://help.github.com/articles/creating-a-pull-request)

[^1]: New to GitHub? Read this great article about [forking and contributing to open-source projects on GitHub](https://help.github.com/articles/fork-a-repo).

## Testing

Don't be **that guy** that broke the build. Tests help us ensure that everything is functioning the way it _should_ be and help us ensure back-compat, or provide a clean migration path.

When making changes to Venus code, there should (almost always) be accompanying test cases. If you're modifying existing functionality, make sure the current tests are passing, or update them to be accurate.
If you're adding new functionality, you must also add test cases to cover it's behavior.

To run the test cases, simply run:

```sh
npm test
```

ps: to run the test you should install those packages:

```sh
npm install mocha
npm install chai
npm install sinon-chai
npm install underscore
npm install json5
npm install winston
npm install i18n
npm install express
npm install consolidate
npm install portscanner
npm install socket.io
npm install fs-tools
npm install mkdirp
npm install istanbul
npm install phantomjs-please
npm install webdriverjs
npm install underscore.string
npm install dustjs-linkedin
npm install useragent-parser
npm install socket.io-client
npm install commander
npm install cli-prompt
npm install wrench
```

## Coding Standards

### General

- Use two "soft spaces", not tabs for indentation
- Always use proper indentation
- Respect the rules defined by our .jshintrc
