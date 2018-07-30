defmodule CrossywordoWeb.IndexController do
  use CrossywordoWeb, :controller

  def index(conn, _params) do
    #changeset = User.changeset(%User{}, user_params)

    render conn, "index.html"
  end
end
