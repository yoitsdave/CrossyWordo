defmodule CrossywordoWeb.RoomController do
  use CrossywordoWeb, :controller

  def join_room(conn, %{"room_name" => room, "submit" => puz}) do
    {:ok, jsond} = Crossywordo.Puz.store({puz, room})
    IO.puts inspect jsond

    render conn, "room.html", room_name: room
  end

  def join_room(conn, %{"room_name" => room}) do
    render conn, "room.html", room_name: room
  end
end
