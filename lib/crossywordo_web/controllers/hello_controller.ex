defmodule CrossywordoWeb.HelloController do
  use CrossywordoWeb, :controller

  def index(conn, _params) do
    render conn, "index.html"
  end
end
