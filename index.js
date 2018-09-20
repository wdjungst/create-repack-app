#!/usr/bin/env node
const chalk       = require('chalk');
const clear       = require('clear');
const CLI         = require('clui');
const figlet      = require('figlet');
const inquirer    = require('inquirer');
const Preferences = require('preferences');
const Spinner     = CLI.Spinner;
const fs          = require('fs-extra');
const files       = require('./lib/files');
const argv        = require('minimist')(process.argv.slice(2));
const cwd = files.getCurrentDirectoryBase()
const { spawn, exec } = require('child_process');
let dest;
let full = false;
let defaultYes = false;
const defaultRailsPort = 3001;

const and = process.platform === 'win32' ? '-and' : '&&'

const initialPrompt = () => {
  clear();
  console.log(chalk.bold.cyan('Welcome To Create Repack App.'));
  console.log()

  dest = argv._[0];
  full = argv.full;
  defaultYes = argv.y;

  if (!dest) {
    console.log(chalk.bold.red('\nrepack <project> no project name specified!'))
  } else if (files.directoryExists(`${cwd}/${dest}`)) {
    console.log(chalk.bold.red('\nA directory already exists with the name given!'))
  } else {
    checkRailsVersions();
  }
}

const installRailsDeps = () => {
  copyStart();
  copyRootController()
  copyConfig()
}

const checkRailsVersions = () => {
  const cmd = 'gem list ^rails$'
  exec(cmd, (error, stdout, stderr) => {
    let match = false;
    try {
      stdout.split("(")[1].split(',').forEach( e => {
        if (/^([5-9]{1})|([0-9]{2,})/.test(parseFloat(e)))
        match = true;
      });
    } catch(err) {
      console.log('ERR: It looks like Rails is not installed: `gem install rails`')
    }

    if (match) {
      if (defaultYes) {
        installApps();
      } else {
        inquirer.prompt(
          [
            {
              type: 'list',
              name: 'cra',
              message: 'Do you have create-react-app installed and globally available?',
              choices: ['Yes', 'No']
            }
          ]
        ).then( (answer) => {
          if (answer.cra === 'Yes') {
            installApps()
          } else {
            console.log('Please install create-react-app run:')
            console.log(`${chalk.cyan('npm install -g create-react-app')} or ${chalk.cyan('yarn global add create-react-app')}`)
          }
        });
      }
    } else {
      console.log('Rails v5 or higher required')
    }
  });
}

const portPrompt = () => {
  if (defaultYes) {
    checkOptions();
    updateClientPackage();
  } else {
    inquirer.prompt(
      [
        {
          type: 'input',
          name: 'port',
          message: 'Rails server port',
          default: '3001'
        }
      ]
    ).then( answer => {
      if (answer.port === '3000') {
        console.log(chalk.yellow('PORT 3000 is the default PORT for create-react-app. We recommend using a different PORT.'))
        inquirer.prompt(
          [
            {
              type: 'list',
              name: 'choice',
              message: 'Do you still want to use PORT 3000 for your rails server?',
              choices: ['Yes', 'No']

            }
          ]
        ).then( (answer) => {
          if (answer.choice === 'No')
            portPrompt();
          else {
            checkOptions(answer.port)
          }
        });
      } else {
        if (parseInt(answer.port).toString() === answer.port) {
          checkOptions(answer.port)
          updateClientPackage(answer.port)
        } else {
          console.log(chalk.yellow('Invalid Port'))
          portPrompt()
        }
      }
    });
  }
}

const prCmd = (cmd) => {
  return new Promise( (res, rej) => {
    const child = spawn(cmd, { stdio: 'inherit', shell: true })
    child.on('close', (code) => {
      res(code);
    });
  })
}

const checkOptions = (port = defaultRailsPort) => {
  if (full) {
    console.log()
    console.log('Performing A Full Install. (Rails, React, React Router, Redux, Devise, Devise Token Auth, Authentication Components)')
    console.log()
    console.log(chalk.cyan('Please Wait, This Could Take A Few Minutes...'))
    console.log()
    const Gemfile = `${dest}/Gemfile`;
    let data = fs.readFileSync(Gemfile).toString().split("\n");
    const index = data.findIndex( line => line === "group :development, :test do" )
    const gems = ["gem 'omniauth'", "gem 'devise'", "gem 'devise_token_auth'"].join("\n");
    data.splice(index, 0, gems);
    fs.writeFile(Gemfile, data.join("\n"))
    const ApplicationController = `${dest}/app/controllers/application_controller.rb`
    const fileContent = fs.readFileSync(ApplicationController).toString().split("\n")
    const line = "\tbefore_action :authenticate_user!, if: proc {\n\t\tbegin\n\t\t\trequest.controller_class.parent == Api\n\t\trescue => NameError\n\t\t\tRails.logger.error(NameError.message)\n\t\t\tnil\n\t\tend\n  }"
    const lineIndex = 1
    fileContent.splice(lineIndex, 0, line)
    fs.writeFile(ApplicationController, fileContent.join("\n"))
    prCmd(`cd ${dest} ${and} spring stop ${and} bundle exec rails db:drop db:create ${and} bundle ${and} bundle exec rails g devise_token_auth:install User api/auth ${and} bundle exec rails db:migrate`)
      .then( res => {
        const Model = `${cwd}/${dest}/app/models/user.rb`;
        let data = fs.readFileSync(Model).toString().replace(" :confirmable,", "")
        fs.writeFile(Model, data)
        const config = `${cwd}/${dest}/config/environments/development.rb`
        let configData = fs.readFileSync(config).toString().split("\n")
        configData.splice(1, 0, `  config.action_mailer.default_url_options = { host: "localhost: ${port}" } `)
        fs.writeFile(config, configData.join("\n"))
        fin(port)
      })
      .catch( err => console.log(`ERR: ${err}`) )

    let cmd = `cd ${dest}/client ${and} yarn add redux redux-thunk react-redux react-router-dom axios devise-axios@1.0.12 semantic-ui-react semantic-ui-css`

    exec(cmd, () => {
      let from = `/example/client/`
      let to = `${dest}/client/`
      try {
        fs.copySync(__dirname + from, to)
      } catch (err) {
        console.log(err)
      }
    })

    exec(`cd ${dest}/client/src ${and} rm -rf App.* *.css *.svg`)
  } else {
    fin(port)
  }
}

const updateClientPackage = (port = defaultRailsPort) => {
  console.log();
  const file = `${dest}/client/package.json`
  let obj = JSON.parse(fs.readFileSync(file, 'utf8'));
  obj.proxy = `http://localhost:${port}`
    const data = JSON.stringify(obj, null, 2);
  fs.truncate(file, 0, () => {
    fs.writeFile(file, data, (err) => {
      if (err) {
        return console.log("An error occurred");
      }
    });
  });
}

const installApps = () => {
  console.log();
  console.log('Writing Server Code...')
  const cmd = `rails new -T -d postgresql --api ${dest}`
  console.log('Writing Client Code...')
  console.log()
  console.log(chalk.cyan('Please Wait, This Could Take A Few Minutes...'))
  console.log()

  exec(cmd, (error, stdout, stderr) => {
    if (!error) {
      const cmd = `cd ${dest} ${and} create-react-app client`

      exec(cmd, (error, stdout, stderr) => {
        installRailsDeps()
        portPrompt()
      });
    } else {
      console.log(chalk.red(`ERROR: ${stderr}`))
    }
  })
}

const copyStart = () => {
  try {
    fs.copySync(__dirname + '/example/package', `${cwd}/${dest}`)
  } catch (err) {
    console.error(err)
  }
}

const copyRootController = () => {
  try {
    fs.copySync(__dirname + '/example/base/controllers', `${cwd}/${dest}/app/controllers/`)
  } catch (err) {
    console.error(err)
  }
}

const copyConfig = () => {
  try {
    fs.copySync(__dirname + '/example/base/config', `${cwd}/${dest}/config/`)
  } catch (err) {
    console.error(err)
  }
}

const fin = (port) => {
  console.log();
  console.log(chalk.bold.green('Project Built Successfully!'))
  console.log()
  console.log(chalk.bold.cyan('GETTING STARTED:'))
  console.log(chalk.bold.white(`cd ${dest}`))
  console.log(chalk.bold.white(`rails s -p ${port}`))
  console.log(chalk.bold.white(`cd client`))
  console.log(chalk.bold.white('yarn start or npm run start'))
  console.log();
  console.log();
  console.log(chalk.bold.cyan('PRODUCTION:'))
  console.log(chalk.bold.white(`If deploying to heroku:`))
  console.log(chalk.bold.white('heroku buildpacks:clear'))
  console.log(chalk.bold.white('heroku buildpacks:set heroku/nodejs'))
  console.log(chalk.bold.white('heroku buildpacks:add heroku/ruby --index 2'))
  console.log();
  console.log();
  console.log(chalk.bold.white('If not deploying to heroku:'))
  console.log(chalk.bold.white(`From root folder: yarn build && yarn deploy`))
  console.log();
}

initialPrompt();
