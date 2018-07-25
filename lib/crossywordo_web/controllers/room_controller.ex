defmodule CrossywordoWeb.RoomController do
  use CrossywordoWeb, :controller

  def show_me(conn, %{"room_name" => room}) do
    {:ok, table_pid} = Crossywordo.Table.get_board(%{name: "empty"})
    render conn, "room.html", room_name: room, pid: table_pid
  end
end
