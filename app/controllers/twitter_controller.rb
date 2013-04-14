require 'twitter'
class TwitterController < ApplicationController

  def index
    configure_twitter_api
    redirect_to :action => 'login' unless session[:oauth_token]
  end


  def login
    begin
      callback_url = "http://localhost:3000/" + "callback"
      client = get_twitter_config
      session[:twitter_request_token] = client.request_token(:oauth_callback => callback_url)
      @authorization_url = session[:twitter_request_token].authorize_url
      render :layout => false
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

  def tweet
    begin
      if params[:reply_id]
        tweet = Twitter.update(params[:comment], :in_reply_to_status_id => params[:post_id])
      elsif params[:retweet_id]
        tweet = Twitter.retweet(params[:retweet_id])
      else
        tweet = Twitter.update(params[:comment])
      end

      render_json(tweet)
    rescue Exception => e
      p e
      render_json({:error => e.message})
    end
  end

  def more_tweets
    begin
      tweets = Twitter.home_timeline(:max_id => params[:max_id], :count => params[:count])
      render_json(tweets)
    rescue Exception => e
      p e
      render_json({:error => e.message})
    end
  end

  def search
    begin
      tweets = (params[:max_id] ? Twitter.search(params[:q], :count => 10, :max_id => params[:max_id]) : Twitter.search(params[:q], :count => 10))
      render_json(tweets)
    rescue Exception => e
      p e
      render_json({:error => e.message})
    end
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

  def timeline
    begin
      tweet_info = {:timeline => Twitter.home_timeline(:count => 10), :user => Twitter.user}
      render_json(tweet_info)
    rescue Exception => e
      p e
      render_json({:error => e.message})
    end
  end

  private

  def configure_twitter_api
    Twitter.configure do |config|
      config.consumer_key = APP_CONFIG['twitter']['consumer_key']
      config.consumer_secret = APP_CONFIG['twitter']['consumer_secret']
      config.oauth_token = session[:oauth_token]
      config.oauth_token_secret = session[:oauth_secret]
    end
  end

  def get_twitter_config
    TwitterOAuth::Client.new(
        :consumer_key => APP_CONFIG['twitter']['consumer_key'],
        :consumer_secret => APP_CONFIG['twitter']['consumer_secret']
    )
  end


end





