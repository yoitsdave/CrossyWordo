defmodule Crossywordo.Board do
  use GenServer

  def start_link(_args) do
    GenServer.start_link(__MODULE__, name: __MODULE__)
  end

  def init(_args) do
    {:ok, body} = File.read("assets/vendor/example.json")
    {:ok, start_board} = Poison.decode(body)
    start_board |> inspect |> IO.puts
    {:ok, start_board}
  end
end
