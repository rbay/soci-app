class ApplicationController < ActionController::Base
  protect_from_forgery

  def render_json(payload, options = {})
    render_options = {}
    if (status  = options.delete(:status))
      render_options[:status] = status
    end
    if (location  = options.delete(:location))
      render_options[:location] = location
    end
    method_prefix = (options.delete(:method) || "to")
    respond_to do |format|
      format.json { render({:json =>  payload.send("#{method_prefix}_json", options)}.merge(render_options))}
    end
  end
end
