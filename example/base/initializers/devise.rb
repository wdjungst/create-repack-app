Devise.setup do |config|
  if Rails.env.development?
    key = SecureRandom.hex
  else 
    key = ENV['DEVISE_SECRET_KEY'] || SecureRandom.hex
  end

  config.secret_key = key
end
