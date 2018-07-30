defmodule CrossywordoWeb.IndexController do
  use CrossywordoWeb, :controller

  def index(conn,  _user_params) do
    render conn, "index.html"
  end

end
