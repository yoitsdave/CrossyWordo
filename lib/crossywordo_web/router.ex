defmodule CrossywordoWeb.Router do
  use CrossywordoWeb, :router

  pipeline :browser do
    plug :accepts, ["html"]
    plug :fetch_session
    plug :fetch_flash
    plug :protect_from_forgery
    plug :put_secure_browser_headers
  end

  pipeline :api do
    plug :accepts, ["json"]
  end

  scope "/", CrossywordoWeb do
    pipe_through :browser # Use the default browser stack

    get "/", IndexController, :index
    post "/room/:room_name", RoomController, :join_room
    get "/room/:room_name", RoomController, :join_room
  end

  # Other scopes may use custom stacks.
  # scope "/api", CrossywordoWeb do
  #   pipe_through :api
  # end
end
