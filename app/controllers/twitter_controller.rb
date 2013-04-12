require 'twitter'
class TwitterController < ApplicationController

  def index
    redirect_to :action => 'login' unless @current_user.oauth_token?
  end


  def login
    begin
      callback_url = "http://localhost:3000/" + "callback"
      client = get_twitter_config
      session[:twitter_request_token] = client.request_token(:oauth_callback => callback_url)
      @authorization_url = session[:twitter_request_token].authorize_url
    rescue Exception => e
      p e
      @error = e.message
    end
  end

  def callback
    access_token_hash = session[:twitter_request_token].get_access_token(:oauth_verifier => params[:oauth_verifier] )
    session[:oauth_token], session[:oauth_secret] = access_token_hash.token, access_token_hash.secret

    render :login
  end

  def logout
    @current_user.logout
    redirect_to :action => 'login'
  end



  def set_twitter_config
    tenant = Tenant.find_by_name(params[:tenant_name])
    begin
      params.each {|k, v| tenant.config_set(k, v) if ((k == 'consumer_key') || (k == 'consumer_secret')) }
      render :text => I18n.t("config.success.updated")
    rescue => e
      Rails.logger.error e.to_s
      Rails.logger.error e.backtrace.join("\n")
      render :text => I18n.t("config.error.server_error")
    end
  end

  private


  def get_twitter_config
    TwitterOAuth::Client.new(
        :consumer_key => APP_CONFIG['twitter']['consumer_key'],
        :consumer_secret => APP_CONFIG['twitter']['consumer_secret']
    )
  end


end





