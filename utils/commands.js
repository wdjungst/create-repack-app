const LIST_RAILS = 'gem list ^rails$'

const RENDER_ERROR = `
  private
    def render_error(model, type = 'array', status = 422)
      case type
        when 'string'
          errors = model.errors.full_messages.join(', ')
        when 'array'
          errors = model.errors.full_messages
        else
          errors = { errors: model.errors }
      end

      render json: errors, status: status
    end
`

const AUTHENTICATE = `
  before_action :authenticate_user!, if: proc {
    begin
      request.controller_class.parent == Api
    rescue => NameError
      Rails.logger.error(NameError.message) 
    end
  }
`

const APP_CONTROLLER = `
${AUTHENTICATE}

${RENDER_ERROR}
`

const perfRails = (dest, and) => `cd ${dest} ${and} spring stop ${and} bundle exec rails db:drop db:create ${and} bundle ${and} bundle exec rails g devise_token_auth:install User api/auth ${and} bundle exec rails db:migrate`

const perfReact = (dest, and) => `cd ${dest}/client ${and} yarn add redux redux-thunk react-redux react-router-dom axios devise-axios@1.0.12 semantic-ui-react semantic-ui-css`

const removeExtras = (dest, and) => `cd ${dest}/client/src ${and} rm -rf App.* *.css *.svg`

module.exports = {
  LIST_RAILS,
  APP_CONTROLLER,
  perfRails,
  perfReact,
  removeExtras,
}
