defmodule CrossywordoWeb.RoomController do
  use CrossywordoWeb, :controller

  def join_room(conn, %{"room_name" => room}) do
    render conn, "room.html", room_name: room
  end
end
