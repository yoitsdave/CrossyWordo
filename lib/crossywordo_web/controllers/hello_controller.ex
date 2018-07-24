defmodule CrossywordoWeb.HelloController do
  use CrossywordoWeb, :controller

  def show_me(conn, %{"extra_data" => messenger}) do
    render conn, "show.html", messenger: messenger
  end
end
