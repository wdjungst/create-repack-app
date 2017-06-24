# The Rules


 * You must use Rails 5+ as it uses the --api flag
 * You must have create-react-app installed globally
 * If things are broken first check to make sure dependencies are up to date
 * Pull requests are welcome


# Usage

 * create-repack-app name_of_app
 * You will be asked if you have create-react-app installed globally.
   * If you say yes and you don't it will break
   * If you say no the program will  exit
 * You will be asked what port you want to run your rails server on.  The default is 3001.  I reccomend not using 3000 as this is the default port for create-react-app and it is easier to change the rails port.
 * If you change your rails port in the future you will need to update the proxy in client/package.json
 * The rails app is located in the root and the react app is located in /client

# Deploy
  If you are deploying to heroku you will need to update the buildpacks:
  NOTE: The order does matter.
  ```
  heroku buildpacks:clear
  heroku buildpacks:set heroku/nodejs
  heroku buildpacks:add heroku/ruby --index 2
  ```
  
  All you have to do now is push to heroku.
  
  
  If you are deploying anywhere else you will need to run the following scripts in the root as part of your deploy process:
  ```
  yarn build
  yarn deploy
  ```
  Or if you prefer:
   ```
  npm run build
  npm run deploy
  ```
  
  # Truth
  This package is not complicated.  It is really just a cli that runs other cli's.
  
  First it installs rails.
 
 Then it copies over a pefilled out config/routes and app/controllers/static_controller.rb as well as a package.json.
  
  Then it installs create-react-app to the client/ folder.
 
 Finally it adds a proxy to client/package.json

  Oh yeah and the name is totally ripped off

