![Logo](./data/images/logo-wide.jpg#gh-dark-mode-only)
![Logo Light](./data/images/logo-wide-light.jpg#gh-light-mode-only)

<div align="center">
  <p>
    <a href="https://discord.gg/9Y8BE2A6cj"><img src="https://img.shields.io/discord/651800564966883328?label=Chat&logo=discord&logoColor=white" alt="Discord server"/></a>
    <a href="https://github.com/Racooder/Racoonia-Guardian"><img src="https://img.shields.io/badge/Version-3.1.0-orange" alt="version"/></a>
    <a href="https://discord.com/api/oauth2/authorize?client_id=821713905692573708&permissions=2048&scope=applications.commands%20bot"><img src="https://img.shields.io/badge/Invite-Guardian-blue" alt="Discord server"/></a>
    <a href="https://github.com/Racooder/guardian-bot/actions/workflows/test.yml"><img src="https://github.com/racooder/guardian-bot/actions/workflows/test.yml/badge.svg" alt="Test Action"></a>
    <a href="https://github.com/Racooder/guardian-bot/actions/workflows/build.yml"><img src="https://github.com/racooder/guardian-bot/actions/workflows/build.yml/badge.svg" alt="Build Action"></a>
</div>

# Guardian

The official discord bot of the Racoonia discord server.

## Usage

### Using my hosted version

Just [invite](https://discord.com/api/oauth2/authorize?client_id=821713905692573708&permissions=2048&scope=applications.commands%20bot) the bot to your discord server and you're done.

### Hosting it yourself

1. Get the latest release from the [releases](https://github.com/Racooder/guardian-bot/releases) section or the latest build from the [build workflow](https://github.com/Racooder/guardian-bot/actions/workflows/build.yml) artifacts.
2. Unzip it in an empty folder
3. Install [node.js](https://nodejs.org/en/download)
4. Install [yarn](https://classic.yarnpkg.com/lang/en/docs/install)
5. Run `yarn` inside the installation directory
6. Rename the `.env.template` file in the `meta` folder to `.env` and setup your environmental variables inside it.
6. Rename the `config.yml.template` file in the `meta` folder to `config.yml` and setup your settings in it.
8. Run `yarn start`

## Build

1. Run `yarn build` in the original directory
2. Copy the contents of `dist` to the target directory
3. Copy the `package.json` to the target directory
4. Copy the `.env.template` as `.env` and `config.yml` to the target directory and fill out all the fields
5. Run `npm install` in the target directory
6. Run `npm run start` in the target directory

## License

The license applies only to the code in this repository.
Images and other assets are explicitly excluded.
The license for the code is the GNU General Public License Version 3.
You can find more information [here](./LICENSE)

## Credits

Thanks to [gotura](https://github.com/gotura) for the logo
